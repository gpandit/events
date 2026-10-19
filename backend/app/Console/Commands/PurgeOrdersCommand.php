<?php

namespace HiEvents\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class PurgeOrdersCommand extends Command
{
    private const ORDER_TABLES_CHILDREN_FIRST = [
        'attendee_check_ins',
        'order_audit_logs',
        'question_answers',
        'waitlist_entries',
        'invoices',
        'order_refunds',
        'order_application_fees',
        'order_payment_platform_fees',
        'stripe_payments',
        'messages',
        'seat_claims',
        'order_items',
        'attendees',
        'orders',
    ];

    private const TABLES_WITH_ROWS_NOT_TIED_TO_ORDERS = [
        'messages',
        'seat_claims',
    ];

    private const TABLES_ALLOWED_TO_HAVE_ORDER_ID_WITHOUT_BEING_PURGED = [
        'question_and_answer_views',
    ];

    private const STATISTICS_TABLES = [
        'event_statistics',
        'event_daily_statistics',
        'event_occurrence_statistics',
        'event_occurrence_daily_statistics',
    ];

    private const STATISTICS_COLUMNS_TO_KEEP = [
        'id',
        'event_id',
        'event_occurrence_id',
        'version',
        'unique_views',
        'total_views',
    ];

    private const COUNTER_COLUMNS = [
        'products' => ['sales_volume', 'sales_tax_volume'],
        'product_prices' => ['quantity_sold'],
        'promo_codes' => ['order_usage_count', 'attendee_usage_count'],
        'affiliates' => ['total_sales', 'total_sales_gross'],
        'capacity_assignments' => ['used_capacity'],
        'event_occurrences' => ['used_capacity', 'cancelled_attendees_count'],
    ];

    protected $signature = 'orders:purge
        {--force : Delete the data. Without this flag the command only reports what it would delete}
        {--confirm-database= : Must equal the name of the connected database when --force is used}';

    protected $description = 'Delete every order and everything attached to it, and reset sales counters and statistics. Irreversible.';

    public function handle(): int
    {
        $database = DB::connection()->getDatabaseName();
        $this->info("Connected to database: {$database}");

        $unknownTables = $this->findUnknownTablesReferencingOrders();
        if ($unknownTables !== []) {
            $this->error('These tables have an order_id column the purge does not know about: '.implode(', ', $unknownTables));

            return self::FAILURE;
        }

        $this->table(['Table', 'Rows'], $this->countRows());

        if (! $this->option('force')) {
            $this->warn('Dry run. Nothing was deleted. Re-run with --force --confirm-database='.$database.' to delete.');

            return self::SUCCESS;
        }

        if ($this->option('confirm-database') !== $database) {
            $this->error("--confirm-database must equal the connected database name ({$database}).");

            return self::FAILURE;
        }

        try {
            DB::transaction(function () {
                $this->deleteOrderData();
                $this->resetCounters();
                $this->resetStatistics();
            });
        } catch (Throwable $exception) {
            $this->error('Purge failed and was rolled back: '.$exception->getMessage());

            return self::FAILURE;
        }

        $this->info('Purge complete.');
        $this->table(['Table', 'Rows'], $this->countRows());

        return self::SUCCESS;
    }

    private function countRows(): array
    {
        return array_map(
            fn (string $table) => [$table, DB::table($table)->when(
                in_array($table, self::TABLES_WITH_ROWS_NOT_TIED_TO_ORDERS, true),
                fn ($query) => $query->whereNotNull('order_id')
            )->count()],
            self::ORDER_TABLES_CHILDREN_FIRST,
        );
    }

    private function deleteOrderData(): void
    {
        foreach (self::ORDER_TABLES_CHILDREN_FIRST as $table) {
            $query = DB::table($table);

            if (in_array($table, self::TABLES_WITH_ROWS_NOT_TIED_TO_ORDERS, true)) {
                $query->whereNotNull('order_id');
            }

            $query->delete();
        }
    }

    private function resetCounters(): void
    {
        foreach (self::COUNTER_COLUMNS as $table => $columns) {
            $existing = array_values(array_filter($columns, fn (string $column) => Schema::hasColumn($table, $column)));

            if ($existing === []) {
                continue;
            }

            DB::table($table)->update(array_fill_keys($existing, 0));
        }
    }

    private function resetStatistics(): void
    {
        foreach (self::STATISTICS_TABLES as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $numericColumns = DB::table('information_schema.columns')
                ->where('table_schema', 'public')
                ->where('table_name', $table)
                ->whereIn('data_type', ['integer', 'bigint', 'smallint', 'numeric'])
                ->whereNotIn('column_name', self::STATISTICS_COLUMNS_TO_KEEP)
                ->pluck('column_name')
                ->all();

            if ($numericColumns !== []) {
                DB::table($table)->update(array_fill_keys($numericColumns, 0));
            }
        }
    }

    private function findUnknownTablesReferencingOrders(): array
    {
        return DB::table('information_schema.columns as c')
            ->join('information_schema.tables as t', function ($join) {
                $join->on('t.table_schema', '=', 'c.table_schema')->on('t.table_name', '=', 'c.table_name');
            })
            ->where('c.table_schema', 'public')
            ->where('c.column_name', 'order_id')
            ->where('t.table_type', 'BASE TABLE')
            ->whereNotIn('c.table_name', array_merge(
                self::ORDER_TABLES_CHILDREN_FIRST,
                self::TABLES_ALLOWED_TO_HAVE_ORDER_ID_WITHOUT_BEING_PURGED,
            ))
            ->pluck('c.table_name')
            ->all();
    }
}
