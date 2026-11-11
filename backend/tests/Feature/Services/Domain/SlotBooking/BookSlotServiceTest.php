<?php

declare(strict_types=1);

namespace Tests\Feature\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\Status\EventStatus;
use HiEvents\Exceptions\SlotAlreadyBookedException;
use HiEvents\Exceptions\SlotBookingMisconfiguredException;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Services\Application\Handlers\EventOccurrence\DTO\GenerateSlotsDTO;
use HiEvents\Services\Domain\EventOccurrence\SlotGeneratorService;
use HiEvents\Services\Domain\ProductCategory\CreateProductCategoryService;
use HiEvents\Services\Domain\SlotBooking\BookSlotService;
use HiEvents\Services\Domain\SlotBooking\DTO\BookSlotDTO;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tests\Feature\Support\InsertsRecurringEventRows;
use Tests\TestCase;

class BookSlotServiceTest extends TestCase
{
    use DatabaseTransactions;
    use InsertsRecurringEventRows;

    /** @var list<int> */
    private array $slotIds;

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
            end_time: '18:15',
            slot_minutes: 5,
            children_per_slot: 2,
        ));

        $this->slotIds = DB::table('event_occurrences')->where('event_id', $this->eventId)->orderBy('start_date')->pluck('id')->all();
    }

    private function book(BookSlotDTO $dto): OrderDomainObject
    {
        return $this->app->make(BookSlotService::class)->book($dto);
    }

    private function dto(int $slotId, array $overrides = []): BookSlotDTO
    {
        return new BookSlotDTO(...array_merge([
            'event_id' => $this->eventId,
            'event_occurrence_id' => $slotId,
            'first_name' => 'Pat',
            'last_name' => 'Parent',
            'email' => 'Pat@Example.test',
            'children' => [['first_name' => 'Emma']],
        ], $overrides));
    }

    private function activeOrders(string $email = 'pat@example.test'): int
    {
        return DB::table('orders')->where('event_id', $this->eventId)->where('email', $email)->where('status', 'COMPLETED')->count();
    }

    public function test_books_a_slot_and_creates_a_named_attendee_per_child(): void
    {
        $order = $this->book($this->dto($this->slotIds[0], ['children' => [['first_name' => 'Emma'], ['first_name' => 'Noah', 'last_name' => 'Other']]]));

        $this->assertSame('COMPLETED', $order->getStatus());
        $attendees = DB::table('attendees')->where('order_id', $order->getId())->orderBy('id')->get();
        $this->assertSame(['Emma', 'Noah'], $attendees->pluck('first_name')->all());
        $this->assertSame(['Parent', 'Other'], $attendees->pluck('last_name')->all());
        $this->assertSame(2, (int) DB::table('event_occurrences')->where('id', $this->slotIds[0])->value('used_capacity'));
    }

    public function test_second_booking_without_replace_is_rejected(): void
    {
        $this->book($this->dto($this->slotIds[0]));

        $this->expectException(SlotAlreadyBookedException::class);

        $this->book($this->dto($this->slotIds[1]));
    }

    public function test_replace_swaps_slots_and_frees_the_old_one(): void
    {
        $this->book($this->dto($this->slotIds[0]));

        $this->book($this->dto($this->slotIds[1], ['replace' => true]));

        $this->assertSame(1, $this->activeOrders());
        $this->assertSame(0, (int) DB::table('event_occurrences')->where('id', $this->slotIds[0])->value('used_capacity'));
        $this->assertSame(1, (int) DB::table('event_occurrences')->where('id', $this->slotIds[1])->value('used_capacity'));
    }

    public function test_replace_into_a_full_slot_keeps_the_original_booking(): void
    {
        $this->book($this->dto($this->slotIds[0]));
        $this->book($this->dto($this->slotIds[1], [
            'email' => 'other@example.test',
            'children' => [['first_name' => 'A'], ['first_name' => 'B']],
        ]));

        try {
            $this->book($this->dto($this->slotIds[1], ['replace' => true]));
            $this->fail('Expected the full slot to be rejected');
        } catch (ValidationException) {
        }

        $this->assertSame(1, $this->activeOrders());
        $this->assertSame(1, (int) DB::table('event_occurrences')->where('id', $this->slotIds[0])->value('used_capacity'));
    }

    public function test_rejects_more_children_than_the_slot_allows(): void
    {
        $this->expectException(ValidationException::class);

        $this->book($this->dto($this->slotIds[0], ['children' => [['first_name' => 'A'], ['first_name' => 'B'], ['first_name' => 'C']]]));
    }

    public function test_refuses_to_book_when_the_slot_ticket_has_been_made_paid(): void
    {
        $productId = (int) DB::table('slot_booking_configs')->where('event_id', $this->eventId)->value('product_id');
        DB::table('product_prices')->where('product_id', $productId)->update(['price' => 25]);

        try {
            $this->book($this->dto($this->slotIds[0]));
            $this->fail('Expected the paid slot ticket to be rejected');
        } catch (SlotBookingMisconfiguredException) {
        }

        $this->assertSame(0, DB::table('orders')->where('event_id', $this->eventId)->where('status', 'COMPLETED')->count());
    }
}
