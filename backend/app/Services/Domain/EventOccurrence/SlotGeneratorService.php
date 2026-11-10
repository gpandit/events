<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\EventOccurrence;

use Carbon\CarbonImmutable;
use HiEvents\DomainObjects\Enums\AttendeeDetailsCollectionMethod;
use HiEvents\DomainObjects\Enums\ProductPriceType;
use HiEvents\DomainObjects\Enums\ProductQuantityAppliesTo;
use HiEvents\DomainObjects\Enums\ProductType;
use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\DomainObjects\EventOccurrenceDomainObject;
use HiEvents\DomainObjects\Generated\EventOccurrenceDomainObjectAbstract;
use HiEvents\DomainObjects\Generated\ProductPriceDomainObjectAbstract;
use HiEvents\DomainObjects\Generated\SlotBookingConfigDomainObjectAbstract;
use HiEvents\DomainObjects\ProductDomainObject;
use HiEvents\DomainObjects\ProductPriceDomainObject;
use HiEvents\DomainObjects\SlotBookingConfigDomainObject;
use HiEvents\DomainObjects\Status\EventOccurrenceStatus;
use HiEvents\Exceptions\InvalidSlotConfigurationException;
use HiEvents\Helper\IdHelper;
use HiEvents\Repository\Interfaces\EventOccurrenceRepositoryInterface;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\EventSettingsRepositoryInterface;
use HiEvents\Repository\Interfaces\ProductCategoryRepositoryInterface;
use HiEvents\Repository\Interfaces\ProductPriceRepositoryInterface;
use HiEvents\Repository\Interfaces\ProductRepositoryInterface;
use HiEvents\Repository\Interfaces\SlotBookingConfigRepositoryInterface;
use HiEvents\Services\Application\Handlers\EventOccurrence\DTO\GenerateSlotsDTO;
use HiEvents\Services\Domain\Product\CreateProductService;
use Illuminate\Database\DatabaseManager;
use Throwable;

class SlotGeneratorService
{
    public function __construct(
        private readonly SlotWindowCalculator $calculator,
        private readonly EventOccurrenceRepositoryInterface $occurrenceRepository,
        private readonly SlotBookingConfigRepositoryInterface $configRepository,
        private readonly EventSettingsRepositoryInterface $eventSettingsRepository,
        private readonly ProductCategoryRepositoryInterface $productCategoryRepository,
        private readonly CreateProductService $createProductService,
        private readonly DatabaseManager $databaseManager,
        private readonly EventRepositoryInterface $eventRepository,
        private readonly ProductRepositoryInterface $productRepository,
        private readonly ProductPriceRepositoryInterface $productPriceRepository,
    ) {}

    /**
     * @throws Throwable
     */
    public function generate(EventDomainObject $event, GenerateSlotsDTO $dto): int
    {
        $slots = $this->calculator->slots(
            date: $dto->date,
            startTime: $dto->start_time,
            endTime: $dto->end_time,
            slotMinutes: $dto->slot_minutes,
            timezone: $event->getTimezone() ?? 'UTC',
        );

        return $this->databaseManager->transaction(function () use ($event, $dto, $slots) {
            $this->upsertConfig($event, $dto);
            $this->eventSettingsRepository->updateWhere(
                attributes: [
                    'attendee_details_collection_method' => AttendeeDetailsCollectionMethod::PER_TICKET->name,
                    'show_available_occurrence_capacity' => true,
                ],
                where: ['event_id' => $event->getId()],
            );

            $existingStarts = collect($this->occurrenceRepository->findWhere([
                EventOccurrenceDomainObjectAbstract::EVENT_ID => $event->getId(),
            ]))->map(fn (EventOccurrenceDomainObject $occurrence) => CarbonImmutable::parse($occurrence->getStartDate())->utc()->toDateTimeString())
                ->flip();

            $rows = [];
            foreach ($slots as $slot) {
                $startUtc = $slot['start']->utc()->toDateTimeString();

                if ($existingStarts->has($startUtc)) {
                    continue;
                }

                $rows[] = [
                    EventOccurrenceDomainObjectAbstract::EVENT_ID => $event->getId(),
                    EventOccurrenceDomainObjectAbstract::SHORT_ID => IdHelper::shortId(IdHelper::OCCURRENCE_PREFIX),
                    EventOccurrenceDomainObjectAbstract::START_DATE => $startUtc,
                    EventOccurrenceDomainObjectAbstract::END_DATE => $slot['end']->utc()->toDateTimeString(),
                    EventOccurrenceDomainObjectAbstract::STATUS => EventOccurrenceStatus::ACTIVE->name,
                    EventOccurrenceDomainObjectAbstract::CAPACITY => $dto->children_per_slot,
                    EventOccurrenceDomainObjectAbstract::USED_CAPACITY => 0,
                    EventOccurrenceDomainObjectAbstract::IS_OVERRIDDEN => false,
                    EventOccurrenceDomainObjectAbstract::LABEL => null,
                ];
            }

            if ($rows !== []) {
                $this->occurrenceRepository->insert($rows);
            }

            return count($rows);
        });
    }

    private function upsertConfig(EventDomainObject $event, GenerateSlotsDTO $dto): void
    {
        /** @var SlotBookingConfigDomainObject|null $config */
        $config = $this->configRepository->findFirstWhere([
            SlotBookingConfigDomainObjectAbstract::EVENT_ID => $event->getId(),
        ]);

        $links = $this->resolveGrottoLinks($event, $dto);

        if ($config === null) {
            $product = $this->createSantaVisitProduct($event, $dto);

            $this->configRepository->create(array_merge([
                SlotBookingConfigDomainObjectAbstract::EVENT_ID => $event->getId(),
                SlotBookingConfigDomainObjectAbstract::PRODUCT_ID => $product->getId(),
                SlotBookingConfigDomainObjectAbstract::SLOT_MINUTES => $dto->slot_minutes,
                SlotBookingConfigDomainObjectAbstract::CHILDREN_PER_SLOT => $dto->children_per_slot,
            ], $links));

            return;
        }

        $this->configRepository->updateFromArray($config->getId(), array_merge([
            SlotBookingConfigDomainObjectAbstract::SLOT_MINUTES => $dto->slot_minutes,
            SlotBookingConfigDomainObjectAbstract::CHILDREN_PER_SLOT => $dto->children_per_slot,
        ], $links));
    }

    /**
     * @return array<string, mixed>
     *
     * @throws InvalidSlotConfigurationException
     */
    private function resolveGrottoLinks(EventDomainObject $event, GenerateSlotsDTO $dto): array
    {
        if ($dto->ticket_event_id === null) {
            return [];
        }

        $ticketEvent = $this->eventRepository->findById($dto->ticket_event_id);

        if ($ticketEvent->getAccountId() !== $event->getAccountId()) {
            throw new InvalidSlotConfigurationException(__('The ticket event must belong to the same account'));
        }

        $childProductIds = array_values(array_unique(array_map('intval', $dto->child_product_ids ?? [])));
        $productIds = array_merge([$dto->grotto_product_id], $childProductIds);

        foreach ($productIds as $productId) {
            if ($productId === null || $this->productRepository->findFirstWhere(['id' => $productId, 'event_id' => $ticketEvent->getId()]) === null) {
                throw new InvalidSlotConfigurationException(__('The Grotto and child products must belong to the ticket event'));
            }
        }

        return [
            SlotBookingConfigDomainObjectAbstract::TICKET_EVENT_ID => $ticketEvent->getId(),
            SlotBookingConfigDomainObjectAbstract::GROTTO_PRODUCT_ID => $dto->grotto_product_id,
            SlotBookingConfigDomainObjectAbstract::CHILD_PRODUCT_IDS => $childProductIds,
        ];
    }

    /**
     * @return list<string|null>
     */
    private function slotPriceLabels(GenerateSlotsDTO $dto): array
    {
        if ($dto->grotto_product_id === null) {
            return [null];
        }

        $labels = $this->productPriceRepository
            ->findWhere([ProductPriceDomainObjectAbstract::PRODUCT_ID => $dto->grotto_product_id])
            ->sortBy(fn (ProductPriceDomainObject $price) => $price->getId())
            ->map(fn (ProductPriceDomainObject $price) => $price->getLabel())
            ->values()
            ->all();

        return $labels === [] ? [null] : $labels;
    }

    private function createSantaVisitProduct(EventDomainObject $event, GenerateSlotsDTO $dto): ProductDomainObject
    {
        $category = $this->productCategoryRepository->findFirstWhere(['event_id' => $event->getId()]);

        $prices = collect($this->slotPriceLabels($dto))->map(fn (?string $label) => ProductPriceDomainObject::hydrateFromArray([
            ProductPriceDomainObjectAbstract::PRICE => 0.00,
            ProductPriceDomainObjectAbstract::LABEL => $label,
            ProductPriceDomainObjectAbstract::SALE_START_DATE => null,
            ProductPriceDomainObjectAbstract::SALE_END_DATE => null,
            ProductPriceDomainObjectAbstract::INITIAL_QUANTITY_AVAILABLE => null,
            ProductPriceDomainObjectAbstract::QUANTITY_APPLIES_TO => ProductQuantityAppliesTo::OCCURRENCE->name,
            ProductPriceDomainObjectAbstract::IS_HIDDEN => false,
            ProductPriceDomainObjectAbstract::COMPARE_AT_PRICE => null,
        ]));

        return $this->createProductService->createProduct(
            product: (new ProductDomainObject)
                ->setTitle(__('Santa Visit'))
                ->setType($prices->count() > 1 ? ProductPriceType::TIERED->name : ProductPriceType::FREE->name)
                ->setProductType(ProductType::TICKET->name)
                ->setProductCategoryId($category->getId())
                ->setEventId($event->getId())
                ->setMaxPerOrder($dto->children_per_slot)
                ->setMinPerOrder(1)
                ->setIsHidden(false)
                ->setStartCollapsed(false)
                ->setHideBeforeSaleStartDate(false)
                ->setHideAfterSaleEndDate(false)
                ->setHideWhenSoldOut(false)
                ->setSequentialTierReleaseEnabled(false)
                ->setShowQuantityRemaining(false)
                ->setIsHiddenWithoutPromoCode(false)
                ->setIsHighlighted(false)
                ->setWaitlistEnabled(true)
                ->setIsAddonOnly(false)
                ->setProductPrices($prices),
            accountId: $dto->account_id,
        );
    }
}
