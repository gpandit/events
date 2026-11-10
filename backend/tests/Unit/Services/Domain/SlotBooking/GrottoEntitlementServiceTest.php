<?php

declare(strict_types=1);

namespace Tests\Unit\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\SlotBookingConfigDomainObject;
use HiEvents\Repository\Interfaces\AttendeeRepositoryInterface;
use HiEvents\Services\Domain\SlotBooking\GrottoEntitlementService;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class GrottoEntitlementServiceTest extends TestCase
{
    private AttendeeRepositoryInterface|MockInterface $attendees;

    private GrottoEntitlementService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->attendees = Mockery::mock(AttendeeRepositoryInterface::class);
        $this->service = new GrottoEntitlementService($this->attendees);
    }

    private function config(?int $ticketEventId = 7, ?int $grottoProductId = 70, array|string|null $children = [11, 12]): SlotBookingConfigDomainObject
    {
        return (new SlotBookingConfigDomainObject)
            ->setTicketEventId($ticketEventId)
            ->setGrottoProductId($grottoProductId)
            ->setChildProductIds($children);
    }

    public function test_free_mode_is_not_gated_and_has_no_purchases(): void
    {
        $config = $this->config(null, null);

        $this->assertFalse($this->service->isGated($config));
        $this->assertSame([], $this->service->purchasedPriceIds($config, 'a@example.test'));
    }

    public function test_purchased_price_ids_come_from_grotto_attendees(): void
    {
        $this->attendees->shouldReceive('getProductPriceIdsForOrderEmail')
            ->with(7, [70], 'a@example.test')->andReturn([701, 702]);

        $this->assertSame([701, 702], $this->service->purchasedPriceIds($this->config(), 'a@example.test'));
    }

    public function test_remaining_purchasable_is_child_tickets_minus_grotto_tickets(): void
    {
        $this->attendees->shouldReceive('getProductPriceIdsForOrderEmail')
            ->with(7, [11, 12], 'a@example.test')->andReturn([111, 111, 121]);
        $this->attendees->shouldReceive('getProductPriceIdsForOrderEmail')
            ->with(7, [70], 'a@example.test')->andReturn([701]);

        $this->assertSame(2, $this->service->remainingPurchasable($this->config(), 'a@example.test'));
    }

    public function test_remaining_never_goes_negative(): void
    {
        $this->attendees->shouldReceive('getProductPriceIdsForOrderEmail')
            ->with(7, [11, 12], 'a@example.test')->andReturn([111]);
        $this->attendees->shouldReceive('getProductPriceIdsForOrderEmail')
            ->with(7, [70], 'a@example.test')->andReturn([701, 702]);

        $this->assertSame(0, $this->service->remainingPurchasable($this->config(), 'a@example.test'));
    }

    public function test_child_product_ids_accept_json_strings(): void
    {
        $this->assertSame([11, 12], $this->service->childProductIds($this->config(children: '[11,"12"]')));
    }
}
