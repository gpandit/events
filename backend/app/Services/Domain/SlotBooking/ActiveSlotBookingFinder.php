<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\Generated\OrderDomainObjectAbstract;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\Status\OrderStatus;
use HiEvents\DomainObjects\Status\WaitlistEntryStatus;
use HiEvents\DomainObjects\WaitlistEntryDomainObject;
use HiEvents\Helper\EmailHelper;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;
use HiEvents\Repository\Interfaces\WaitlistEntryRepositoryInterface;

class ActiveSlotBookingFinder
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly WaitlistEntryRepositoryInterface $waitlistEntryRepository,
    ) {}

    public function findActiveOrder(int $eventId, string $email): ?OrderDomainObject
    {
        $order = $this->orderRepository->findFirstWhere([
            OrderDomainObjectAbstract::EVENT_ID => $eventId,
            OrderDomainObjectAbstract::EMAIL => mb_strtolower(trim($email)),
            OrderDomainObjectAbstract::STATUS => OrderStatus::COMPLETED->name,
        ]);

        return $order ?? $this->findOrderAcceptedFromWaitlist($eventId, $email);
    }

    private function findOrderAcceptedFromWaitlist(int $eventId, string $email): ?OrderDomainObject
    {
        $entries = $this->waitlistEntryRepository->findWhere([
            'event_id' => $eventId,
            'email' => EmailHelper::normalize($email),
            'status' => WaitlistEntryStatus::PURCHASED->name,
            ['order_id', 'not null', null],
        ]);

        /** @var WaitlistEntryDomainObject $entry */
        foreach ($entries as $entry) {
            $order = $this->orderRepository->findFirstWhere([
                OrderDomainObjectAbstract::ID => $entry->getOrderId(),
                OrderDomainObjectAbstract::STATUS => OrderStatus::COMPLETED->name,
            ]);

            if ($order !== null) {
                return $order;
            }
        }

        return null;
    }
}
