<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\Generated\OrderDomainObjectAbstract;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\Status\OrderStatus;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;

class ActiveSlotBookingFinder
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
    ) {}

    public function findActiveOrder(int $eventId, string $email): ?OrderDomainObject
    {
        return $this->orderRepository->findFirstWhere([
            OrderDomainObjectAbstract::EVENT_ID => $eventId,
            OrderDomainObjectAbstract::EMAIL => mb_strtolower(trim($email)),
            OrderDomainObjectAbstract::STATUS => OrderStatus::COMPLETED->name,
        ]);
    }
}
