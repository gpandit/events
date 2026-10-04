<?php

declare(strict_types=1);

namespace Tests\Feature\Console;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\Feature\Support\InsertsRecurringEventRows;
use Tests\TestCase;

class PurgeOrdersCommandTest extends TestCase
{
    use DatabaseTransactions;
    use InsertsRecurringEventRows;

    private int $productId;

    private int $priceId;

    private int $occurrenceId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->insertAccountAndOrganizer();
        $this->eventId = $this->insertEvent();
        $this->occurrenceId = $this->insertOccurrence();
        $this->productId = $this->insertProduct();
        $this->priceId = $this->insertPrice($this->productId, initialQuantity: 10);
        $this->sellTickets($this->productId, $this->priceId, $this->occurrenceId, 2);
        $this->sellTickets($this->productId, $this->priceId, $this->occurrenceId, 1);
        DB::table('product_prices')->where('id', $this->priceId)->update(['quantity_sold' => 3]);
        DB::table('products')->where('id', $this->productId)->update(['sales_volume' => 90]);
    }

    public function test_dry_run_deletes_nothing(): void
    {
        $this->artisan('orders:purge')->assertSuccessful();

        $this->assertSame(2, DB::table('orders')->count());
        $this->assertSame(3, DB::table('attendees')->count());
    }

    public function test_force_without_the_database_name_deletes_nothing(): void
    {
        $this->artisan('orders:purge', ['--force' => true, '--confirm-database' => 'wrong'])->assertFailed();

        $this->assertSame(2, DB::table('orders')->count());
    }

    public function test_force_with_the_database_name_deletes_orders_and_resets_counters(): void
    {
        $this->artisan('orders:purge', [
            '--force' => true,
            '--confirm-database' => DB::connection()->getDatabaseName(),
        ])->assertSuccessful();

        $this->assertSame(0, DB::table('orders')->count());
        $this->assertSame(0, DB::table('order_items')->count());
        $this->assertSame(0, DB::table('attendees')->count());
        $this->assertSame(0, (int) DB::table('product_prices')->where('id', $this->priceId)->value('quantity_sold'));
        $this->assertEquals(0, DB::table('products')->where('id', $this->productId)->value('sales_volume'));
        $this->assertSame(1, DB::table('products')->where('id', $this->productId)->count());
        $this->assertSame(1, DB::table('events')->where('id', $this->eventId)->count());
    }
}
