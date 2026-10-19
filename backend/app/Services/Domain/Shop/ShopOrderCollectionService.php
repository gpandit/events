<?php

namespace HiEvents\Services\Domain\Shop;

use HiEvents\DomainObjects\Enums\CollectionStatus;
use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\DomainObjects\EventSettingDomainObject;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\OrderItemDomainObject;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\QuestionAndAnswerViewDomainObject;
use HiEvents\DomainObjects\Status\OrderStatus;
use HiEvents\Exceptions\EventNotAShopException;
use HiEvents\Mail\Order\OrderReadyForCollectionEmail;
use HiEvents\Repository\Eloquent\Value\Relationship;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Support\Collection;

class ShopOrderCollectionService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly EventRepositoryInterface $eventRepository,
        private readonly ShopOrderDetailsService $shopOrderDetailsService,
        private readonly Mailer $mailer,
    ) {}

    /**
     * @param  array<int, int>  $orderIds
     *
     * @throws EventNotAShopException
     */
    public function markReady(int $eventId, array $orderIds): int
    {
        $event = $this->getShop($eventId);

        $orders = $this->findPendingOrders($eventId, $orderIds);

        foreach ($orders as $order) {
            $this->orderRepository->updateFromArray($order->getId(), [
                'collection_status' => CollectionStatus::READY->value,
                'ready_for_collection_at' => now(),
            ]);

            $this->sendReadyEmail($event, $order);
        }

        return $orders->count();
    }

    /**
     * @param  array<int, int>  $orderIds
     *
     * @throws EventNotAShopException
     */
    public function markCollected(int $eventId, array $orderIds): int
    {
        $this->getShop($eventId);

        return $this->orderRepository->updateWhere(
            attributes: [
                'collection_status' => CollectionStatus::COLLECTED->value,
                'collected_at' => now(),
            ],
            where: [
                'event_id' => $eventId,
                'status' => OrderStatus::COMPLETED->name,
                ['id', 'in', $orderIds],
            ],
        );
    }

    /**
     * @return Collection<int, OrderDomainObject>
     */
    private function findPendingOrders(int $eventId, array $orderIds): Collection
    {
        return $this->orderRepository
            ->loadRelation(QuestionAndAnswerViewDomainObject::class)
            ->loadRelation(OrderItemDomainObject::class)
            ->findWhere([
                'event_id' => $eventId,
                'status' => OrderStatus::COMPLETED->name,
                ['id', 'in', $orderIds],
                static fn ($query) => $query->where(static function ($builder) {
                    $builder->whereNull('collection_status')
                        ->orWhere('collection_status', CollectionStatus::PENDING->value);
                }),
            ]);
    }

    /**
     * @throws EventNotAShopException
     */
    private function getShop(int $eventId): EventDomainObject
    {
        $event = $this->eventRepository
            ->loadRelation(new Relationship(OrganizerDomainObject::class, name: 'organizer'))
            ->loadRelation(EventSettingDomainObject::class)
            ->findById($eventId);

        if (! $event->getIsShop()) {
            throw new EventNotAShopException(__('Collection is only available for shops'));
        }

        return $event;
    }

    private function sendReadyEmail(EventDomainObject $event, OrderDomainObject $order): void
    {
        $this->mailer
            ->to($order->getEmail())
            ->locale($order->getLocale())
            ->send(new OrderReadyForCollectionEmail(
                order: $order,
                event: $event,
                organizer: $event->getOrganizer(),
                eventSettings: $event->getEventSettings(),
                studentName: $this->shopOrderDetailsService->studentName($order),
            ));
    }
}
