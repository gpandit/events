<?php

declare(strict_types=1);

namespace Tests\Feature\Services\Domain\EventOccurrence;

use HiEvents\Exceptions\InvalidSlotConfigurationException;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Services\Application\Handlers\EventOccurrence\DTO\GenerateSlotsDTO;
use HiEvents\Services\Domain\EventOccurrence\SlotGeneratorService;
use HiEvents\Services\Domain\ProductCategory\CreateProductCategoryService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\Feature\Support\InsertsRecurringEventRows;
use Tests\TestCase;

class SlotGeneratorServiceTest extends TestCase
{
    use DatabaseTransactions;
    use InsertsRecurringEventRows;

    private SlotGeneratorService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = $this->app->make(SlotGeneratorService::class);
        $this->insertAccountAndOrganizer();
        $this->eventId = $this->insertEvent();

        $event = $this->app->make(EventRepositoryInterface::class)->findById($this->eventId);
        $this->app->make(CreateProductCategoryService::class)->createDefaultProductCategory($event);
    }

    private function dto(array $overrides = []): GenerateSlotsDTO
    {
        return new GenerateSlotsDTO(...array_merge([
            'event_id' => $this->eventId,
            'account_id' => $this->accountId,
            'date' => '2026-12-10',
            'start_time' => '18:00',
            'end_time' => '22:00',
            'slot_minutes' => 5,
            'children_per_slot' => 2,
        ], $overrides));
    }

    private function generate(array $overrides = []): int
    {
        $event = $this->app->make(EventRepositoryInterface::class)->findById($this->eventId);

        return $this->service->generate($event, $this->dto($overrides));
    }

    public function test_creates_forty_eight_slots_with_configured_capacity(): void
    {
        $this->assertSame(48, $this->generate());

        $occurrences = DB::table('event_occurrences')->where('event_id', $this->eventId)->get();
        $this->assertCount(48, $occurrences);
        $this->assertSame([2], $occurrences->pluck('capacity')->unique()->values()->all());
    }

    public function test_creates_free_product_and_config(): void
    {
        $this->generate();

        $config = DB::table('slot_booking_configs')->where('event_id', $this->eventId)->first();
        $this->assertSame(5, $config->slot_minutes);
        $this->assertSame(2, $config->children_per_slot);

        $product = DB::table('products')->where('id', $config->product_id)->first();
        $this->assertSame('FREE', $product->type);
        $this->assertSame(2, $product->max_per_order);
    }

    public function test_configures_event_settings_for_named_tickets_and_visible_capacity(): void
    {
        DB::table('event_settings')->insert(['event_id' => $this->eventId, 'created_at' => now(), 'updated_at' => now()]);

        $this->generate();

        $settings = DB::table('event_settings')->where('event_id', $this->eventId)->first();
        $this->assertSame('PER_TICKET', $settings->attendee_details_collection_method);
        $this->assertTrue((bool) $settings->show_available_occurrence_capacity);
    }

    public function test_running_twice_does_not_duplicate_slots_or_products(): void
    {
        $this->generate();

        $this->assertSame(0, $this->generate());
        $this->assertSame(48, DB::table('event_occurrences')->where('event_id', $this->eventId)->count());
        $this->assertSame(1, DB::table('products')->where('event_id', $this->eventId)->count());
    }

    public function test_rejects_window_that_does_not_divide(): void
    {
        $this->expectException(InvalidSlotConfigurationException::class);

        $this->generate(['end_time' => '18:07']);
    }

    private function insertTicketEventWithGrotto(): array
    {
        $ticketEventId = $this->insertEvent();
        $category = DB::table('product_categories')->where('event_id', $ticketEventId)->value('id') ?? DB::table('product_categories')->insertGetId([
            'event_id' => $ticketEventId, 'name' => 'Tickets', 'is_hidden' => false, 'order' => 1, 'created_at' => now(), 'updated_at' => now(),
        ]);
        $grotto = DB::table('products')->insertGetId([
            'event_id' => $ticketEventId, 'product_category_id' => $category, 'title' => 'Grotto', 'type' => 'TIERED',
            'product_type' => 'GENERAL', 'order' => 1, 'created_at' => now(), 'updated_at' => now(),
        ]);
        $child = DB::table('products')->insertGetId([
            'event_id' => $ticketEventId, 'product_category_id' => $category, 'title' => 'Child', 'type' => 'PAID',
            'product_type' => 'TICKET', 'order' => 2, 'created_at' => now(), 'updated_at' => now(),
        ]);
        foreach ([['Photo', 5], ['Photo magnet', 8]] as [$label, $price]) {
            DB::table('product_prices')->insert([
                'product_id' => $grotto, 'label' => $label, 'price' => $price, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        return [$ticketEventId, $grotto, $child];
    }

    public function test_linked_mode_mirrors_grotto_price_labels_and_stores_links(): void
    {
        [$ticketEventId, $grotto, $child] = $this->insertTicketEventWithGrotto();

        $this->generate(['ticket_event_id' => $ticketEventId, 'grotto_product_id' => $grotto, 'child_product_ids' => [$child]]);

        $config = DB::table('slot_booking_configs')->where('event_id', $this->eventId)->first();
        $this->assertSame($ticketEventId, (int) $config->ticket_event_id);
        $this->assertSame($grotto, (int) $config->grotto_product_id);
        $this->assertSame([$child], json_decode($config->child_product_ids, true));

        $labels = DB::table('product_prices')->where('product_id', $config->product_id)->orderBy('id')->pluck('label')->all();
        $this->assertSame(['Photo', 'Photo magnet'], $labels);
        $this->assertSame([0.0, 0.0], DB::table('product_prices')->where('product_id', $config->product_id)->orderBy('id')->pluck('price')->map(fn ($p) => (float) $p)->all());
    }

    public function test_linked_mode_rejects_products_from_another_event(): void
    {
        [$ticketEventId, $grotto] = $this->insertTicketEventWithGrotto();
        $otherEvent = $this->insertEvent();

        $this->expectException(InvalidSlotConfigurationException::class);

        $this->generate(['ticket_event_id' => $otherEvent, 'grotto_product_id' => $grotto, 'child_product_ids' => [$grotto]]);
    }
}
