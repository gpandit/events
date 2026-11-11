<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\SlotBookingConfigDomainObject;
use HiEvents\Repository\Interfaces\SlotBookingConfigRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class GrottoPurchaseRule
{
    public function __construct(
        private readonly SlotBookingConfigRepositoryInterface $configRepository,
        private readonly GrottoEntitlementService $entitlementService,
    ) {}

    /**
     * @return list<int>
     */
    public function grottoProductIds(int $eventId): array
    {
        return $this->configsByGrottoProductId($eventId)->keys()->map(fn ($id) => (int) $id)->all();
    }

    /**
     * @throws ValidationException
     */
    public function assertNotDirectSlotPurchase(int $eventId, array $data): void
    {
        $config = $this->configRepository->findFirstWhere(['event_id' => $eventId]);

        if ($config === null) {
            return;
        }

        $lines = collect($data['products']);
        $lineIndex = $lines->search(fn ($line) => (int) $line['product_id'] === $config->getProductId()
            && collect($line['quantities'])->sum('quantity') > 0);

        if ($lineIndex !== false) {
            throw ValidationException::withMessages([
                'products.'.$lineIndex => __('Santa visits are booked from the visit booking page, not from the ticket page'),
            ]);
        }
    }

    /**
     * @throws ValidationException
     */
    public function assertWithinEntitlement(int $eventId, array $data, ?string $customerEmail): void
    {
        $configs = $this->configsByGrottoProductId($eventId);

        if ($configs->isEmpty()) {
            return;
        }

        $lines = collect($data['products']);
        $quantities = $lines
            ->groupBy(fn ($line) => (int) $line['product_id'])
            ->map(fn (Collection $group) => $group->sum(fn ($line) => collect($line['quantities'])->sum('quantity')));

        foreach ($configs as $grottoProductId => $config) {
            $grottoQuantity = (int) ($quantities->get($grottoProductId) ?? 0);

            if ($grottoQuantity <= 0) {
                continue;
            }

            $childrenInOrder = collect($this->entitlementService->childProductIds($config))
                ->sum(fn (int $childProductId) => (int) ($quantities->get($childProductId) ?? 0));

            $childrenAlreadyHeld = $customerEmail === null
                ? 0
                : $this->entitlementService->remainingPurchasable($config, $customerEmail);

            if ($grottoQuantity > $childrenInOrder + $childrenAlreadyHeld) {
                $lineIndex = $lines->search(fn ($line) => (int) $line['product_id'] === $grottoProductId);

                throw ValidationException::withMessages([
                    'products.'.(is_int($lineIndex) ? $lineIndex : 0) => __('Grotto tickets are limited to the number of child tickets you hold'),
                ]);
            }
        }
    }

    /**
     * @return Collection<int, SlotBookingConfigDomainObject>
     */
    private function configsByGrottoProductId(int $eventId): Collection
    {
        return $this->configRepository
            ->findWhere(['ticket_event_id' => $eventId])
            ->filter(fn (SlotBookingConfigDomainObject $config) => $config->getGrottoProductId() !== null)
            ->keyBy(fn (SlotBookingConfigDomainObject $config) => $config->getGrottoProductId());
    }
}
