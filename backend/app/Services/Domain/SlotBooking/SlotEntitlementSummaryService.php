<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\Generated\ProductPriceDomainObjectAbstract;
use HiEvents\DomainObjects\ProductPriceDomainObject;
use HiEvents\DomainObjects\SlotBookingConfigDomainObject;
use HiEvents\Repository\Interfaces\ProductPriceRepositoryInterface;

class SlotEntitlementSummaryService
{
    public function __construct(
        private readonly GrottoEntitlementService $entitlementService,
        private readonly ProductPriceRepositoryInterface $productPriceRepository,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function summarise(SlotBookingConfigDomainObject $config, string $email): array
    {
        if (! $this->entitlementService->isGated($config)) {
            return [
                'gated' => false,
                'children_per_slot' => $config->getChildrenPerSlot(),
            ];
        }

        return [
            'gated' => true,
            'children_per_slot' => $config->getChildrenPerSlot(),
            'purchased' => count($this->entitlementService->purchasedPriceIds($config, $email)),
            'remaining_purchasable' => $this->entitlementService->remainingPurchasable($config, $email),
            'ticket_event_id' => $config->getTicketEventId(),
            'grotto_product_id' => $config->getGrottoProductId(),
            'grotto_prices' => $this->productPriceRepository
                ->findWhere([ProductPriceDomainObjectAbstract::PRODUCT_ID => $config->getGrottoProductId()])
                ->sortBy(fn (ProductPriceDomainObject $price) => $price->getId())
                ->map(fn (ProductPriceDomainObject $price) => [
                    'id' => $price->getId(),
                    'label' => $price->getLabel(),
                    'price' => (float) $price->getPrice(),
                ])
                ->values()
                ->all(),
        ];
    }
}
