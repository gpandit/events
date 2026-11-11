<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\Generated\ProductPriceDomainObjectAbstract;
use HiEvents\DomainObjects\Generated\SlotBookingConfigDomainObjectAbstract;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\ProductPriceDomainObject;
use HiEvents\DomainObjects\SlotBookingConfigDomainObject;
use HiEvents\Enterprise\Seating\Services\Domain\SeatingEventLockService;
use HiEvents\Exceptions\GrottoNotPurchasedException;
use HiEvents\Exceptions\SlotAlreadyBookedException;
use HiEvents\Exceptions\SlotBookingMisconfiguredException;
use HiEvents\Exceptions\SlotBookingNotEnabledException;
use HiEvents\Repository\Interfaces\EventOccurrenceRepositoryInterface;
use HiEvents\Repository\Interfaces\ProductPriceRepositoryInterface;
use HiEvents\Repository\Interfaces\SlotBookingConfigRepositoryInterface;
use HiEvents\Services\Application\Handlers\Order\CompleteOrderHandler;
use HiEvents\Services\Application\Handlers\Order\CreateOrderHandler;
use HiEvents\Services\Application\Handlers\Order\DTO\CompleteOrderDTO;
use HiEvents\Services\Application\Handlers\Order\DTO\CompleteOrderOrderDTO;
use HiEvents\Services\Application\Handlers\Order\DTO\CompleteOrderProductDataDTO;
use HiEvents\Services\Application\Handlers\Order\DTO\CreateOrderPublicDTO;
use HiEvents\Services\Application\Handlers\Order\DTO\ProductOrderDetailsDTO;
use HiEvents\Services\Domain\Order\OrderCancelService;
use HiEvents\Services\Domain\Product\DTO\OrderProductPriceDTO;
use HiEvents\Services\Domain\Product\SoldAndReservedQuantitiesService;
use HiEvents\Services\Domain\SlotBooking\DTO\BookSlotDTO;
use Illuminate\Database\DatabaseManager;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class BookSlotService
{
    public function __construct(
        private readonly DatabaseManager $databaseManager,
        private readonly SeatingEventLockService $eventLock,
        private readonly SlotBookingConfigRepositoryInterface $configRepository,
        private readonly ProductPriceRepositoryInterface $productPriceRepository,
        private readonly ActiveSlotBookingFinder $activeBookingFinder,
        private readonly OrderCancelService $orderCancelService,
        private readonly CreateOrderHandler $createOrderHandler,
        private readonly CompleteOrderHandler $completeOrderHandler,
        private readonly Request $request,
        private readonly GrottoEntitlementService $entitlementService,
        private readonly EventOccurrenceRepositoryInterface $occurrenceRepository,
        private readonly SlotWaitlistEntryCanceller $waitlistEntryCanceller,
        private readonly SoldAndReservedQuantitiesService $soldAndReservedQuantities,
    ) {}

    /**
     * @throws SlotBookingNotEnabledException
     * @throws SlotAlreadyBookedException
     * @throws ValidationException
     * @throws Throwable
     */
    public function book(BookSlotDTO $dto): OrderDomainObject
    {
        return $this->databaseManager->transaction(function () use ($dto) {
            $this->eventLock->lock($dto->event_id);

            $config = $this->getConfig($dto->event_id);
            $this->assertChildCount($dto);
            $childPriceIds = $this->resolveChildPriceIds($dto, $config);
            $this->releaseExistingBooking($dto);
            $this->releaseWaitlistPlaces($dto);
            $allowOvercapacity = $this->groupNeedsEmptySlot($dto);

            $sessionId = $this->pinCheckoutSession();

            $order = $this->createOrderHandler->handle(
                eventId: $dto->event_id,
                createOrderPublicDTO: new CreateOrderPublicDTO(
                    products: collect([new ProductOrderDetailsDTO(
                        product_id: $config->getProductId(),
                        quantities: collect(array_count_values($childPriceIds))
                            ->map(fn (int $quantity, int $priceId) => new OrderProductPriceDTO(
                                quantity: $quantity,
                                price_id: $priceId,
                            ))
                            ->values(),
                        event_occurrence_id: $dto->event_occurrence_id,
                    )]),
                    is_user_authenticated: $dto->is_staff,
                    session_identifier: $sessionId,
                    order_locale: $dto->locale,
                ),
                deleteExistingOrdersForSession: false,
                allowOccurrenceOvercapacity: $allowOvercapacity,
            );

            return $this->completeOrderHandler->handle(
                $order->getShortId(),
                $this->buildCompleteOrderDTO($dto, $childPriceIds),
            );
        });
    }

    private function pinCheckoutSession(): string
    {
        $sessionId = sha1(Str::uuid().Str::random(40));
        $this->request->query->set('session_identifier', $sessionId);

        return $sessionId;
    }

    /**
     * @throws SlotBookingNotEnabledException
     */
    private function getConfig(int $eventId): SlotBookingConfigDomainObject
    {
        $config = $this->configRepository->findFirstWhere([
            SlotBookingConfigDomainObjectAbstract::EVENT_ID => $eventId,
        ]);

        if ($config === null) {
            throw new SlotBookingNotEnabledException(__('Slot booking is not enabled for this event'));
        }

        return $config;
    }

    /**
     * @throws ValidationException
     */
    private function assertChildCount(BookSlotDTO $dto): void
    {
        if (count($dto->children) < 1) {
            throw ValidationException::withMessages([
                'children' => [__('Add at least one child')],
            ]);
        }
    }

    /**
     * @throws ValidationException
     */
    private function groupNeedsEmptySlot(BookSlotDTO $dto): bool
    {
        $occurrence = $this->occurrenceRepository->findFirstWhere([
            'id' => $dto->event_occurrence_id,
            'event_id' => $dto->event_id,
        ]);

        if ($occurrence === null || $occurrence->getCapacity() === null) {
            return false;
        }

        $reserved = $this->soldAndReservedQuantities->getReservedTicketsForOccurrence($occurrence->getId());
        $available = $occurrence->getCapacity() - $occurrence->getUsedCapacity() - $reserved;

        if (count($dto->children) <= $available) {
            return false;
        }

        if ($occurrence->getUsedCapacity() === 0 && $reserved === 0) {
            return true;
        }

        throw ValidationException::withMessages([
            'children' => [__('This slot can take :available more child(ren). Choose an empty slot to bring your whole group.', ['available' => max(0, $available)])],
        ]);
    }

    private function releaseWaitlistPlaces(BookSlotDTO $dto): void
    {
        if (! $dto->is_staff) {
            $this->waitlistEntryCanceller->cancelFor($dto->event_id, $dto->email);
        }
    }

    /**
     * @throws SlotAlreadyBookedException
     * @throws Throwable
     */
    private function releaseExistingBooking(BookSlotDTO $dto): void
    {
        if ($dto->is_staff) {
            return;
        }

        $existing = $this->activeBookingFinder->findActiveOrder($dto->event_id, $dto->email);

        if ($existing === null) {
            return;
        }

        if (! $dto->replace) {
            throw new SlotAlreadyBookedException(
                __('You already have a Santa visit booked. Confirm to replace it with this slot.')
            );
        }

        $this->orderCancelService->cancelOrder($existing);
    }

    /**
     * @return list<int> slot-product price id for each child, in child order
     *
     * @throws GrottoNotPurchasedException
     * @throws SlotBookingMisconfiguredException
     * @throws ValidationException
     */
    private function resolveChildPriceIds(BookSlotDTO $dto, SlotBookingConfigDomainObject $config): array
    {
        $slotPrices = $this->productPriceRepository
            ->findWhere([ProductPriceDomainObjectAbstract::PRODUCT_ID => $config->getProductId()])
            ->sortBy(fn (ProductPriceDomainObject $price) => $price->getId())
            ->values();

        if ($slotPrices->contains(fn (ProductPriceDomainObject $price) => (float) $price->getPrice() > 0)) {
            throw new SlotBookingMisconfiguredException(
                __('The Santa Visit ticket on this event must be free. Ask the organiser to set its prices to 0.')
            );
        }

        $basePriceId = $slotPrices->first()->getId();
        $priceIdForLabel = fn (?string $label): int => $slotPrices
            ->first(fn (ProductPriceDomainObject $price) => $price->getLabel() === $label)?->getId() ?? $basePriceId;

        $children = array_values($dto->children);

        if ($dto->is_staff || ! $this->entitlementService->isGated($config)) {
            return array_map(fn (array $child) => $priceIdForLabel($child['price_label'] ?? null), $children);
        }

        $purchased = $this->purchasedPricesHighestFirst($config, $dto->email);

        if ($purchased->isEmpty()) {
            throw new GrottoNotPurchasedException(__('Buy a Grotto ticket to book a visit'));
        }

        if (count($children) > $purchased->count()) {
            throw ValidationException::withMessages([
                'children' => [__('You have :count Grotto ticket(s), so you can book up to :count child(ren)', ['count' => $purchased->count()])],
            ]);
        }

        return $purchased->take(count($children))
            ->map(fn (ProductPriceDomainObject $price) => $priceIdForLabel($price->getLabel()))
            ->values()
            ->all();
    }

    /**
     * @return Collection<int, ProductPriceDomainObject>
     */
    private function purchasedPricesHighestFirst(SlotBookingConfigDomainObject $config, string $email): Collection
    {
        $purchasedIds = $this->entitlementService->purchasedPriceIds($config, $email);

        if ($purchasedIds === []) {
            return collect();
        }

        $pricesById = $this->productPriceRepository
            ->findWhereIn(ProductPriceDomainObjectAbstract::ID, array_values(array_unique($purchasedIds)))
            ->keyBy(fn (ProductPriceDomainObject $price) => $price->getId());

        return collect($purchasedIds)
            ->map(fn (int $priceId) => $pricesById->get($priceId))
            ->filter()
            ->sortByDesc(fn (ProductPriceDomainObject $price) => $price->getPrice())
            ->values();
    }

    /**
     * @param  list<int>  $childPriceIds
     */
    private function buildCompleteOrderDTO(BookSlotDTO $dto, array $childPriceIds): CompleteOrderDTO
    {
        $email = mb_strtolower(trim($dto->email));

        return new CompleteOrderDTO(
            order: new CompleteOrderOrderDTO(
                first_name: $dto->first_name,
                last_name: $dto->last_name,
                email: $email,
                questions: null,
            ),
            products: collect(array_values($dto->children))->map(fn (array $child, int $index) => new CompleteOrderProductDataDTO(
                product_price_id: $childPriceIds[$index],
                first_name: $child['first_name'],
                last_name: ($child['last_name'] ?? null) ?: $dto->last_name,
                email: $email,
            )),
            event_id: $dto->event_id,
        );
    }
}
