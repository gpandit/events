<?php

namespace HiEvents\Listeners\Order;

use HiEvents\DomainObjects\Status\OrderStatus;
use HiEvents\Events\OrderStatusChangedEvent;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Services\Domain\Customer\CustomerService;
use Psr\Log\LoggerInterface;
use Throwable;

class UpsertCustomerListener
{
    public function __construct(
        private readonly CustomerService $customerService,
        private readonly EventRepositoryInterface $eventRepository,
        private readonly LoggerInterface $logger,
    ) {}

    public function handle(OrderStatusChangedEvent $event): void
    {
        $order = $event->order;

        if ($order->getStatus() !== OrderStatus::COMPLETED->name || ! $order->getEmail()) {
            return;
        }

        try {
            $organizerId = $this->eventRepository->findById($order->getEventId())->getOrganizerId();

            $this->customerService->recordPurchase($order, $organizerId);
        } catch (Throwable $exception) {
            $this->logger->error('Failed to record customer for completed order', [
                'order_id' => $order->getId(),
                'exception' => $exception->getMessage(),
            ]);
        }
    }
}
