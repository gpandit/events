<?php

declare(strict_types=1);

namespace Tests\Feature\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\Status\EventStatus;
use HiEvents\Exceptions\GrottoNotPurchasedException;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Services\Application\Handlers\EventOccurrence\DTO\GenerateSlotsDTO;
use HiEvents\Services\Domain\Customer\CustomerService;
use HiEvents\Services\Domain\EventOccurrence\SlotGeneratorService;
use HiEvents\Services\Domain\ProductCategory\CreateProductCategoryService;
use HiEvents\Services\Domain\SlotBooking\BookSlotService;
use HiEvents\Services\Domain\SlotBooking\DTO\BookSlotDTO;
use HiEvents\Services\Domain\SlotBooking\SlotWaitlistService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tests\Feature\Support\InsertsRecurringEventRows;
use Tests\TestCase;

class GrottoGatedBookingTest extends TestCase
{
    use DatabaseTransactions;
    use InsertsRecurringEventRows;

    private int $ticketEventId;

    private int $grottoProductId;

    private int $childProductId;

    private int $photoPriceId;

    private int $magnetPriceId;

    private int $slotId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->insertAccountAndOrganizer();
        $this->ticketEventId = $this->insertEvent();
        $this->seedTicketEventProducts();

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
            children_per_slot: 3,
            ticket_event_id: $this->ticketEventId,
            grotto_product_id: $this->grottoProductId,
            child_product_ids: [$this->childProductId],
        ));
        $this->slotId = (int) DB::table('event_occurrences')->where('event_id', $this->eventId)->orderBy('start_date')->value('id');
    }

    private function seedTicketEventProducts(): void
    {
        $category = DB::table('product_categories')->insertGetId([
            'event_id' => $this->ticketEventId, 'name' => 'Tickets', 'is_hidden' => false, 'order' => 1,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->grottoProductId = DB::table('products')->insertGetId([
            'event_id' => $this->ticketEventId, 'product_category_id' => $category, 'title' => 'Grotto', 'type' => 'TIERED',
            'product_type' => 'GENERAL', 'order' => 1, 'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->childProductId = DB::table('products')->insertGetId([
            'event_id' => $this->ticketEventId, 'product_category_id' => $category, 'title' => 'Child', 'type' => 'PAID',
            'product_type' => 'TICKET', 'order' => 2, 'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->photoPriceId = DB::table('product_prices')->insertGetId([
            'product_id' => $this->grottoProductId, 'label' => 'Photo', 'price' => 5, 'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->magnetPriceId = DB::table('product_prices')->insertGetId([
            'product_id' => $this->grottoProductId, 'label' => 'Photo magnet', 'price' => 8, 'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    private function purchaseGrotto(string $email, array $grottoPriceIds): void
    {
        $orderId = DB::table('orders')->insertGetId([
            'short_id' => 'ord_'.uniqid(), 'event_id' => $this->ticketEventId, 'currency' => 'USD', 'status' => 'COMPLETED',
            'email' => $email, 'public_id' => 'PUB_'.uniqid(), 'created_at' => now(), 'updated_at' => now(),
        ]);

        foreach ($grottoPriceIds as $priceId) {
            DB::table('attendees')->insert([
                'short_id' => 'att_'.uniqid(), 'email' => $email, 'order_id' => $orderId, 'product_id' => $this->grottoProductId,
                'product_price_id' => $priceId, 'event_id' => $this->ticketEventId, 'public_id' => 'ATT_'.uniqid(),
                'status' => 'ACTIVE', 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    private function book(array $children, array $overrides = [])
    {
        return $this->app->make(BookSlotService::class)->book(new BookSlotDTO(...array_merge([
            'event_id' => $this->eventId,
            'event_occurrence_id' => $this->slotId,
            'first_name' => 'Pat',
            'last_name' => 'Parent',
            'email' => 'Buyer@Example.test',
            'children' => $children,
        ], $overrides)));
    }

    private function labelsOfBookedChildren(int $orderId): array
    {
        return DB::table('attendees')
            ->join('product_prices', 'product_prices.id', '=', 'attendees.product_price_id')
            ->where('attendees.order_id', $orderId)
            ->orderBy('attendees.id')
            ->pluck('product_prices.label', 'attendees.first_name')
            ->all();
    }

    public function test_booking_without_a_grotto_purchase_is_refused(): void
    {
        $this->expectException(GrottoNotPurchasedException::class);

        $this->book([['first_name' => 'Emma']]);
    }

    public function test_each_child_gets_the_tier_that_was_bought_magnets_first(): void
    {
        $this->purchaseGrotto('buyer@example.test', [$this->photoPriceId, $this->magnetPriceId]);

        $order = $this->book([['first_name' => 'Emma'], ['first_name' => 'Noah']]);

        $this->assertSame(['Emma' => 'Photo magnet', 'Noah' => 'Photo'], $this->labelsOfBookedChildren($order->getId()));
    }

    public function test_cannot_book_more_children_than_grotto_tickets_bought(): void
    {
        $this->purchaseGrotto('buyer@example.test', [$this->photoPriceId, $this->magnetPriceId]);

        $this->expectException(ValidationException::class);

        $this->book([['first_name' => 'A'], ['first_name' => 'B'], ['first_name' => 'C']]);
    }

    public function test_purchases_by_another_email_do_not_count(): void
    {
        $this->purchaseGrotto('someone-else@example.test', [$this->photoPriceId]);

        $this->expectException(GrottoNotPurchasedException::class);

        $this->book([['first_name' => 'Emma']]);
    }

    public function test_staff_can_book_without_a_purchase_and_pick_a_tier(): void
    {
        $order = $this->book(
            [['first_name' => 'Emma', 'price_label' => 'Photo magnet'], ['first_name' => 'Noah']],
            ['is_staff' => true, 'email' => 'staff@example.test'],
        );

        $this->assertSame(['Emma' => 'Photo magnet', 'Noah' => 'Photo'], $this->labelsOfBookedChildren($order->getId()));
    }

    private function fillEverySlotAsStaff(): void
    {
        foreach (DB::table('event_occurrences')->where('event_id', $this->eventId)->pluck('id') as $slotId) {
            $this->book(
                [['first_name' => 'A'], ['first_name' => 'B'], ['first_name' => 'C']],
                ['is_staff' => true, 'email' => 'staff+'.$slotId.'@example.test', 'event_occurrence_id' => (int) $slotId],
            );
        }
    }

    private function joinWaitlist(string $email)
    {
        $customer = $this->app->make(CustomerService::class)->findOrCreate($this->organizerId, 'Pat', 'Parent', $email);

        return $this->app->make(SlotWaitlistService::class)->join($customer, $this->eventId, 'en');
    }

    public function test_waitlist_requires_a_grotto_purchase(): void
    {
        $this->fillEverySlotAsStaff();

        $this->expectException(GrottoNotPurchasedException::class);

        $this->joinWaitlist('buyer@example.test');
    }

    public function test_waitlist_is_open_to_grotto_ticket_holders_when_full(): void
    {
        $this->fillEverySlotAsStaff();
        $this->purchaseGrotto('buyer@example.test', [$this->photoPriceId]);

        $entry = $this->joinWaitlist('buyer@example.test');

        $this->assertNull($entry->getEventOccurrenceId());
    }
}
