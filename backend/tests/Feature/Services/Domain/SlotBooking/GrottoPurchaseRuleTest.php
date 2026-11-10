<?php

declare(strict_types=1);

namespace Tests\Feature\Services\Domain\SlotBooking;

use HiEvents\Services\Domain\SlotBooking\GrottoPurchaseRule;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tests\Feature\Support\InsertsRecurringEventRows;
use Tests\TestCase;

class GrottoPurchaseRuleTest extends TestCase
{
    use DatabaseTransactions;
    use InsertsRecurringEventRows;

    private int $ticketEventId;

    private int $grottoProductId;

    private int $childProductId;

    private int $childPriceId;

    private int $grottoPriceId;

    private GrottoPurchaseRule $rule;

    protected function setUp(): void
    {
        parent::setUp();

        $this->insertAccountAndOrganizer();
        $this->ticketEventId = $this->insertEvent();
        $slotEventId = $this->insertEvent();

        $category = DB::table('product_categories')->insertGetId([
            'event_id' => $this->ticketEventId, 'name' => 'Tickets', 'is_hidden' => false, 'order' => 1,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->grottoProductId = $this->insertProductRow($category, 'Grotto', 'GENERAL');
        $this->childProductId = $this->insertProductRow($category, 'Child', 'TICKET');

        $this->childPriceId = DB::table('product_prices')->insertGetId([
            'product_id' => $this->childProductId, 'price' => 10, 'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->grottoPriceId = DB::table('product_prices')->insertGetId([
            'product_id' => $this->grottoProductId, 'price' => 5, 'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('slot_booking_configs')->insert([
            'event_id' => $slotEventId, 'product_id' => $this->grottoProductId, 'slot_minutes' => 5, 'children_per_slot' => 1,
            'ticket_event_id' => $this->ticketEventId, 'grotto_product_id' => $this->grottoProductId,
            'child_product_ids' => json_encode([$this->childProductId]), 'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->rule = $this->app->make(GrottoPurchaseRule::class);
    }

    private function insertProductRow(int $category, string $title, string $productType): int
    {
        return DB::table('products')->insertGetId([
            'event_id' => $this->ticketEventId, 'product_category_id' => $category, 'title' => $title, 'type' => 'PAID',
            'product_type' => $productType, 'order' => 1, 'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    private function hold(string $email, int $productId, int $count): void
    {
        $orderId = DB::table('orders')->insertGetId([
            'short_id' => 'ord_'.uniqid(), 'event_id' => $this->ticketEventId, 'currency' => 'USD', 'status' => 'COMPLETED',
            'email' => $email, 'public_id' => 'PUB_'.uniqid(), 'created_at' => now(), 'updated_at' => now(),
        ]);

        for ($i = 0; $i < $count; $i++) {
            DB::table('attendees')->insert([
                'short_id' => 'att_'.uniqid(), 'email' => $email, 'order_id' => $orderId, 'product_id' => $productId,
                'product_price_id' => $productId === $this->grottoProductId ? $this->grottoPriceId : $this->childPriceId, 'event_id' => $this->ticketEventId, 'public_id' => 'ATT_'.uniqid(),
                'status' => 'ACTIVE', 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    private function order(int $children, int $grotto): array
    {
        $lines = [];
        if ($children > 0) {
            $lines[] = ['product_id' => $this->childProductId, 'quantities' => [['quantity' => $children, 'price_id' => $this->childPriceId]]];
        }
        if ($grotto > 0) {
            $lines[] = ['product_id' => $this->grottoProductId, 'quantities' => [['quantity' => $grotto, 'price_id' => $this->grottoPriceId]]];
        }

        return ['products' => $lines];
    }

    public function test_lists_the_grotto_product_ids_for_the_ticket_event(): void
    {
        $this->assertSame([$this->grottoProductId], $this->rule->grottoProductIds($this->ticketEventId));
        $this->assertSame([], $this->rule->grottoProductIds($this->ticketEventId + 999));
    }

    public function test_same_checkout_allows_one_grotto_per_child_ticket(): void
    {
        $this->rule->assertWithinEntitlement($this->ticketEventId, $this->order(children: 2, grotto: 2), null);

        $this->addToAssertionCount(1);
    }

    public function test_same_checkout_refuses_more_grotto_than_child_tickets(): void
    {
        $this->expectException(ValidationException::class);

        $this->rule->assertWithinEntitlement($this->ticketEventId, $this->order(children: 1, grotto: 2), null);
    }

    public function test_standalone_grotto_without_a_token_is_refused(): void
    {
        $this->expectException(ValidationException::class);

        $this->rule->assertWithinEntitlement($this->ticketEventId, $this->order(children: 0, grotto: 1), null);
    }

    public function test_standalone_grotto_is_allowed_for_a_customer_holding_an_unused_child_ticket(): void
    {
        $this->hold('buyer@example.test', $this->childProductId, 1);

        $this->rule->assertWithinEntitlement($this->ticketEventId, $this->order(children: 0, grotto: 1), 'Buyer@example.test');

        $this->addToAssertionCount(1);
    }

    public function test_standalone_grotto_is_refused_once_every_child_ticket_has_a_grotto(): void
    {
        $this->hold('buyer@example.test', $this->childProductId, 1);
        $this->hold('buyer@example.test', $this->grottoProductId, 1);

        $this->expectException(ValidationException::class);

        $this->rule->assertWithinEntitlement($this->ticketEventId, $this->order(children: 0, grotto: 1), 'buyer@example.test');
    }

    public function test_orders_without_grotto_are_untouched(): void
    {
        $this->rule->assertWithinEntitlement($this->ticketEventId, $this->order(children: 3, grotto: 0), null);

        $this->addToAssertionCount(1);
    }
}
