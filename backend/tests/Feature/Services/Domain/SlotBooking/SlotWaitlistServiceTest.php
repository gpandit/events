<?php

declare(strict_types=1);

namespace Tests\Feature\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\DomainObjects\EventSettingDomainObject;
use HiEvents\DomainObjects\Status\EventStatus;
use HiEvents\DomainObjects\Status\WaitlistEntryStatus;
use HiEvents\Exceptions\SlotAlreadyBookedException;
use HiEvents\Exceptions\SlotsStillAvailableException;
use HiEvents\Repository\Eloquent\Value\Relationship;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Services\Application\Handlers\EventOccurrence\DTO\GenerateSlotsDTO;
use HiEvents\Services\Domain\Customer\CustomerService;
use HiEvents\Services\Domain\EventOccurrence\SlotGeneratorService;
use HiEvents\Services\Domain\Order\OrderCancelService;
use HiEvents\Services\Domain\ProductCategory\CreateProductCategoryService;
use HiEvents\Services\Domain\SlotBooking\BookSlotService;
use HiEvents\Services\Domain\SlotBooking\DTO\BookSlotDTO;
use HiEvents\Services\Domain\SlotBooking\SlotWaitlistService;
use HiEvents\Services\Domain\Waitlist\ProcessWaitlistService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Tests\Feature\Support\InsertsRecurringEventRows;
use Tests\TestCase;

class SlotWaitlistServiceTest extends TestCase
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
            end_time: '18:10',
            slot_minutes: 5,
            children_per_slot: 1,
        ));
        $this->slotIds = DB::table('event_occurrences')->where('event_id', $this->eventId)->orderBy('start_date')->pluck('id')->all();
    }

    private function customer(string $email): CustomerDomainObject
    {
        return $this->app->make(CustomerService::class)->findOrCreate(
            organizerId: $this->organizerId,
            firstName: 'Parent',
            lastName: ucfirst(strtok($email, '@')),
            email: $email,
        );
    }

    private function book(int $slotId, string $email)
    {
        return $this->app->make(BookSlotService::class)->book(new BookSlotDTO(
            event_id: $this->eventId,
            event_occurrence_id: $slotId,
            first_name: 'Parent',
            last_name: 'X',
            email: $email,
            children: [['first_name' => 'Kid']],
        ));
    }

    private function fillAllSlots(): array
    {
        return [
            $this->book($this->slotIds[0], 'a@example.test'),
            $this->book($this->slotIds[1], 'b@example.test'),
        ];
    }

    public function test_cannot_join_while_a_slot_has_room(): void
    {
        $this->book($this->slotIds[0], 'a@example.test');

        $this->expectException(SlotsStillAvailableException::class);

        $this->app->make(SlotWaitlistService::class)->join($this->customer('c@example.test'), $this->eventId, 'en');
    }

    public function test_joins_event_wide_when_every_slot_is_full(): void
    {
        $this->fillAllSlots();

        $entry = $this->app->make(SlotWaitlistService::class)->join($this->customer('c@example.test'), $this->eventId, 'en');

        $this->assertNull($entry->getEventOccurrenceId());
        $this->assertSame(WaitlistEntryStatus::WAITING->name, $entry->getStatus());
    }

    public function test_customer_holding_a_slot_cannot_join(): void
    {
        $this->fillAllSlots();

        $this->expectException(SlotAlreadyBookedException::class);

        $this->app->make(SlotWaitlistService::class)->join($this->customer('a@example.test'), $this->eventId, 'en');
    }

    public function test_freed_slot_is_offered_to_the_event_wide_entry_and_bound_to_that_slot(): void
    {
        [$orderA] = $this->fillAllSlots();
        $entry = $this->app->make(SlotWaitlistService::class)->join($this->customer('c@example.test'), $this->eventId, 'en');

        $this->app->make(OrderCancelService::class)->cancelOrder($orderA);

        $event = $this->app->make(EventRepositoryInterface::class)
            ->loadRelation(new Relationship(EventSettingDomainObject::class))
            ->findById($this->eventId);
        $priceId = (int) DB::table('waitlist_entries')->where('id', $entry->getId())->value('product_price_id');

        $offered = $this->app->make(ProcessWaitlistService::class)->offerToNext(
            productPriceId: $priceId,
            quantity: 1,
            event: $event,
            eventSettings: $event->getEventSettings(),
            eventOccurrenceId: $this->slotIds[0],
        );

        $this->assertCount(1, $offered);
        $row = DB::table('waitlist_entries')->where('id', $entry->getId())->first();
        $this->assertSame(WaitlistEntryStatus::OFFERED->name, $row->status);
        $this->assertSame($this->slotIds[0], (int) $row->event_occurrence_id);
    }
}
