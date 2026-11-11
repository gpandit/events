<?php

declare(strict_types=1);

namespace HiEvents\Listeners\SlotBooking;

use HiEvents\Events\OrderCancelledEvent;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;
use HiEvents\Services\Domain\SlotBooking\SlotBookingReleaseService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Throwable;

class ReleaseSlotBookingOnOrderCancelledListener implements ShouldQueue
{
    public bool $afterCommit = true;

    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly SlotBookingReleaseService $releaseService,
    ) {}

    /**
     * @throws Throwable
     */
    public function handle(OrderCancelledEvent $event): void
    {
        $order = $this->orderRepository->findById($event->orderId);

        $this->releaseService->releaseForCancelledOrder($order);
    }
}
