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
}
