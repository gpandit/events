<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\DomainObjects\EventOccurrenceDomainObject;
use HiEvents\DomainObjects\EventSettingDomainObject;
use HiEvents\DomainObjects\Generated\EventOccurrenceDomainObjectAbstract;
use HiEvents\DomainObjects\Generated\ProductPriceDomainObjectAbstract;
use HiEvents\DomainObjects\Generated\SlotBookingConfigDomainObjectAbstract;
use HiEvents\DomainObjects\Status\EventOccurrenceStatus;
use HiEvents\DomainObjects\WaitlistEntryDomainObject;
use HiEvents\Exceptions\ResourceConflictException;
use HiEvents\Exceptions\SlotAlreadyBookedException;
use HiEvents\Exceptions\SlotBookingNotEnabledException;
use HiEvents\Exceptions\SlotsStillAvailableException;
use HiEvents\Repository\Eloquent\Value\Relationship;
use HiEvents\Repository\Interfaces\EventOccurrenceRepositoryInterface;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\ProductPriceRepositoryInterface;
use HiEvents\Repository\Interfaces\ProductRepositoryInterface;
use HiEvents\Repository\Interfaces\SlotBookingConfigRepositoryInterface;
use HiEvents\Services\Application\Handlers\Waitlist\DTO\CreateWaitlistEntryDTO;
use HiEvents\Services\Domain\Waitlist\CreateWaitlistEntryService;

class SlotWaitlistService
{
    public function __construct(
        private readonly SlotBookingConfigRepositoryInterface $configRepository,
        private readonly EventOccurrenceRepositoryInterface $occurrenceRepository,
        private readonly EventRepositoryInterface $eventRepository,
        private readonly ProductRepositoryInterface $productRepository,
        private readonly ProductPriceRepositoryInterface $productPriceRepository,
        private readonly ActiveSlotBookingFinder $activeBookingFinder,
        private readonly CreateWaitlistEntryService $createWaitlistEntryService,
    ) {}

    /**
     * @throws SlotBookingNotEnabledException
     * @throws SlotsStillAvailableException
     * @throws SlotAlreadyBookedException
     * @throws ResourceConflictException
     */
    public function join(CustomerDomainObject $customer, int $eventId, string $locale): WaitlistEntryDomainObject
    {
        $config = $this->configRepository->findFirstWhere([
            SlotBookingConfigDomainObjectAbstract::EVENT_ID => $eventId,
        ]);

        if ($config === null) {
            throw new SlotBookingNotEnabledException(__('Slot booking is not enabled for this event'));
        }

        if ($this->hasAvailableSlot($eventId)) {
            throw new SlotsStillAvailableException(__('Slots are still available, so the waitlist is closed'));
        }

        if ($this->activeBookingFinder->findActiveOrder($eventId, $customer->getEmail()) !== null) {
            throw new SlotAlreadyBookedException(__('You already have a Santa visit booked'));
        }

        $event = $this->eventRepository
            ->loadRelation(new Relationship(EventSettingDomainObject::class))
            ->findById($eventId);

        $priceId = $this->productPriceRepository->findFirstWhere([
            ProductPriceDomainObjectAbstract::PRODUCT_ID => $config->getProductId(),
        ])->getId();

        return $this->createWaitlistEntryService->createEntry(
            dto: new CreateWaitlistEntryDTO(
                event_id: $eventId,
                product_price_id: $priceId,
                email: $customer->getEmail(),
                first_name: $customer->getFirstName(),
                last_name: $customer->getLastName(),
                locale: $locale,
                event_occurrence_id: null,
            ),
            eventSettings: $event->getEventSettings(),
            product: $this->productRepository->findById($config->getProductId()),
        );
    }

    private function hasAvailableSlot(int $eventId): bool
    {
        return $this->occurrenceRepository
            ->findWhere([
                EventOccurrenceDomainObjectAbstract::EVENT_ID => $eventId,
                EventOccurrenceDomainObjectAbstract::STATUS => EventOccurrenceStatus::ACTIVE->name,
                [EventOccurrenceDomainObjectAbstract::START_DATE, '>', now()->toDateTimeString()],
            ])
            ->contains(fn (EventOccurrenceDomainObject $occurrence) => $occurrence->getCapacity() === null
                || $occurrence->getCapacity() - $occurrence->getUsedCapacity() > 0);
    }
}
