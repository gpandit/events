<?php

declare(strict_types=1);

namespace Tests\Feature\Http\Actions\SlotBooking;

use HiEvents\DomainObjects\Status\EventStatus;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Services\Application\Handlers\EventOccurrence\DTO\GenerateSlotsDTO;
use HiEvents\Services\Domain\EventOccurrence\SlotGeneratorService;
use HiEvents\Services\Domain\ProductCategory\CreateProductCategoryService;
use HiEvents\Services\Domain\TicketLookup\TicketLookupTokenService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\Feature\Support\InsertsRecurringEventRows;
use Tests\TestCase;

class BookSlotActionPublicTest extends TestCase
{
    use DatabaseTransactions;
    use InsertsRecurringEventRows;

    private int $slotId;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->insertAccountAndOrganizer();
        $this->eventId = $this->insertEvent();
        DB::table('events')->where('id', $this->eventId)->update(['status' => EventStatus::LIVE->name]);
        DB::table('event_settings')->insert(['event_id' => $this->eventId, 'created_at' => now(), 'updated_at' => now()]);

        $event = $this->app->make(EventRepositoryInterface::class)->findById($this->eventId);
        $this->app->make(CreateProductCategoryService::class)->createDefaultProductCategory($event);
        $this->app->make(SlotGeneratorService::class)->generate($event, new GenerateSlotsDTO(
            event_id: $this->eventId,
            account_id: $this->accountId,
            date: '2026-12-10',
            start_time: '18:00',
            end_time: '18:10',
            slot_minutes: 5,
            children_per_slot: 2,
        ));
        $this->slotId = (int) DB::table('event_occurrences')->where('event_id', $this->eventId)->orderBy('start_date')->value('id');

        DB::table('customers')->insert([
            'organizer_id' => $this->organizerId,
            'first_name' => 'Pat',
            'last_name' => 'Parent',
            'email' => 'pat@example.test',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->token = $this->app->make(TicketLookupTokenService::class)->issue('pat@example.test');
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'event_occurrence_id' => $this->slotId,
            'children' => [['first_name' => 'Emma']],
        ], $overrides);
    }

    public function test_rejects_anonymous_visitors(): void
    {
        $this->postJson("/public/events/{$this->eventId}/slot-bookings", $this->payload())
            ->assertStatus(401);

        $this->assertSame(0, DB::table('orders')->where('event_id', $this->eventId)->count());
    }

    public function test_rejects_an_unknown_token(): void
    {
        $this->postJson("/public/events/{$this->eventId}/slot-bookings", $this->payload(), ['X-Customer-Token' => 'tl_nope'])
            ->assertStatus(401);
    }

    public function test_logged_in_customer_books_a_slot(): void
    {
        $this->postJson("/public/events/{$this->eventId}/slot-bookings", $this->payload(), ['X-Customer-Token' => $this->token])
            ->assertStatus(201);

        $this->assertSame(1, DB::table('orders')->where('event_id', $this->eventId)->where('email', 'pat@example.test')->where('status', 'COMPLETED')->count());
    }

    public function test_second_booking_needs_replace_confirmation(): void
    {
        $headers = ['X-Customer-Token' => $this->token];
        $url = "/public/events/{$this->eventId}/slot-bookings";
        $secondSlot = (int) DB::table('event_occurrences')->where('event_id', $this->eventId)->orderByDesc('start_date')->value('id');

        $this->postJson($url, $this->payload(), $headers)->assertStatus(201);
        $this->postJson($url, $this->payload(['event_occurrence_id' => $secondSlot]), $headers)->assertStatus(409);
    }
}
