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
use HiEvents\Helper\IdHelper;
use HiEvents\Repository\Interfaces\EventOccurrenceRepositoryInterface;
use HiEvents\Repository\Interfaces\EventSettingsRepositoryInterface;
use HiEvents\Repository\Interfaces\ProductCategoryRepositoryInterface;
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
                attributes: ['attendee_details_collection_method' => AttendeeDetailsCollectionMethod::PER_TICKET->name],
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

        if ($config === null) {
            $product = $this->createSantaVisitProduct($event, $dto);

            $this->configRepository->create([
                SlotBookingConfigDomainObjectAbstract::EVENT_ID => $event->getId(),
                SlotBookingConfigDomainObjectAbstract::PRODUCT_ID => $product->getId(),
                SlotBookingConfigDomainObjectAbstract::SLOT_MINUTES => $dto->slot_minutes,
                SlotBookingConfigDomainObjectAbstract::CHILDREN_PER_SLOT => $dto->children_per_slot,
            ]);

            return;
        }

        $this->configRepository->updateFromArray($config->getId(), [
            SlotBookingConfigDomainObjectAbstract::SLOT_MINUTES => $dto->slot_minutes,
            SlotBookingConfigDomainObjectAbstract::CHILDREN_PER_SLOT => $dto->children_per_slot,
        ]);
    }

    private function createSantaVisitProduct(EventDomainObject $event, GenerateSlotsDTO $dto): ProductDomainObject
    {
        $category = $this->productCategoryRepository->findFirstWhere(['event_id' => $event->getId()]);

        $price = ProductPriceDomainObject::hydrateFromArray([
            ProductPriceDomainObjectAbstract::PRICE => 0.00,
            ProductPriceDomainObjectAbstract::LABEL => null,
            ProductPriceDomainObjectAbstract::SALE_START_DATE => null,
            ProductPriceDomainObjectAbstract::SALE_END_DATE => null,
            ProductPriceDomainObjectAbstract::INITIAL_QUANTITY_AVAILABLE => null,
            ProductPriceDomainObjectAbstract::QUANTITY_APPLIES_TO => ProductQuantityAppliesTo::OCCURRENCE->name,
            ProductPriceDomainObjectAbstract::IS_HIDDEN => false,
            ProductPriceDomainObjectAbstract::COMPARE_AT_PRICE => null,
        ]);

        return $this->createProductService->createProduct(
            product: (new ProductDomainObject)
                ->setTitle(__('Santa Visit'))
                ->setType(ProductPriceType::FREE->name)
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
                ->setWaitlistEnabled(false)
                ->setIsAddonOnly(false)
                ->setProductPrices(collect([$price])),
            accountId: $dto->account_id,
        );
    }
}
