<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\Generated\AttendeeDomainObjectAbstract;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\SlotBookingConfigDomainObject;
use HiEvents\DomainObjects\Status\AttendeeStatus;
use HiEvents\Repository\Interfaces\AttendeeRepositoryInterface;
use HiEvents\Repository\Interfaces\SlotBookingConfigRepositoryInterface;
use HiEvents\Services\Domain\Order\OrderCancelService;
use Throwable;

class SlotBookingReleaseService
{
    public function __construct(
        private readonly SlotBookingConfigRepositoryInterface $configRepository,
        private readonly AttendeeRepositoryInterface $attendeeRepository,
        private readonly ActiveSlotBookingFinder $activeBookingFinder,
        private readonly GrottoEntitlementService $entitlementService,
        private readonly OrderCancelService $orderCancelService,
    ) {}

    /**
     * @throws Throwable
     */
    public function releaseForCancelledOrder(OrderDomainObject $cancelledOrder): void
    {
        $email = $cancelledOrder->getEmail();

        if ($email === null) {
            return;
        }

        $configs = $this->configRepository->findWhere(['ticket_event_id' => $cancelledOrder->getEventId()]);

        foreach ($configs as $config) {
            if ($this->orderHeldGrottoTickets($cancelledOrder, $config)) {
                $this->releaseIfNoLongerCovered($config, $email);
            }
        }
    }

    private function orderHeldGrottoTickets(OrderDomainObject $order, SlotBookingConfigDomainObject $config): bool
    {
        return $config->getGrottoProductId() !== null
            && $this->attendeeRepository->findWhere([
                AttendeeDomainObjectAbstract::ORDER_ID => $order->getId(),
                AttendeeDomainObjectAbstract::PRODUCT_ID => $config->getGrottoProductId(),
            ])->isNotEmpty();
    }

    /**
     * @throws Throwable
     */
    private function releaseIfNoLongerCovered(SlotBookingConfigDomainObject $config, string $email): void
    {
        $slotOrder = $this->activeBookingFinder->findActiveOrder($config->getEventId(), $email);

        if ($slotOrder === null) {
            return;
        }

        $bookedChildren = $this->attendeeRepository->findWhere([
            AttendeeDomainObjectAbstract::ORDER_ID => $slotOrder->getId(),
            AttendeeDomainObjectAbstract::STATUS => AttendeeStatus::ACTIVE->name,
        ])->count();

        if (count($this->entitlementService->purchasedPriceIds($config, $email)) < $bookedChildren) {
            $this->orderCancelService->cancelOrder($slotOrder);
        }
    }
}
