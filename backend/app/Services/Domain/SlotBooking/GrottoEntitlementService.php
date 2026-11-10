<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\SlotBookingConfigDomainObject;
use HiEvents\Repository\Interfaces\AttendeeRepositoryInterface;

class GrottoEntitlementService
{
    public function __construct(
        private readonly AttendeeRepositoryInterface $attendeeRepository,
    ) {}

    public function isGated(SlotBookingConfigDomainObject $config): bool
    {
        return $config->getTicketEventId() !== null && $config->getGrottoProductId() !== null;
    }

    /**
     * @return list<int>
     */
    public function purchasedPriceIds(SlotBookingConfigDomainObject $config, string $email): array
    {
        if (! $this->isGated($config)) {
            return [];
        }

        return $this->attendeeRepository->getProductPriceIdsForOrderEmail(
            $config->getTicketEventId(),
            [$config->getGrottoProductId()],
            $email,
        );
    }

    public function childTicketCount(SlotBookingConfigDomainObject $config, string $email): int
    {
        $childProductIds = $this->childProductIds($config);

        if (! $this->isGated($config) || $childProductIds === []) {
            return 0;
        }

        return count($this->attendeeRepository->getProductPriceIdsForOrderEmail(
            $config->getTicketEventId(),
            $childProductIds,
            $email,
        ));
    }

    public function remainingPurchasable(SlotBookingConfigDomainObject $config, string $email): int
    {
        return max(0, $this->childTicketCount($config, $email) - count($this->purchasedPriceIds($config, $email)));
    }

    /**
     * @return list<int>
     */
    public function childProductIds(SlotBookingConfigDomainObject $config): array
    {
        $ids = $config->getChildProductIds();

        if (is_string($ids)) {
            $ids = json_decode($ids, true);
        }

        return array_values(array_map('intval', $ids ?? []));
    }
}
