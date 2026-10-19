<?php

namespace HiEvents\Services\Application\Handlers\Shop;

use HiEvents\DomainObjects\Enums\CollectionStatus;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\OrderItemDomainObject;
use HiEvents\DomainObjects\QuestionAndAnswerViewDomainObject;
use HiEvents\DomainObjects\Status\OrderStatus;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;
use HiEvents\Services\Domain\Shop\DTO\ShopPickListRowDTO;
use HiEvents\Services\Domain\Shop\ShopOrderDetailsService;
use Illuminate\Support\Collection;

class GetShopPickListHandler
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly ShopOrderDetailsService $shopOrderDetailsService,
    ) {}

    /**
     * @return Collection<int, ShopPickListRowDTO>
     */
    public function handle(int $eventId, CollectionStatus $status): Collection
    {
        return $this->orderRepository
            ->loadRelation(QuestionAndAnswerViewDomainObject::class)
            ->loadRelation(OrderItemDomainObject::class)
            ->findWhere([
                'event_id' => $eventId,
                'status' => OrderStatus::COMPLETED->name,
            ])
            ->map(fn (OrderDomainObject $order) => $this->shopOrderDetailsService->toPickListRow($order))
            ->filter(static fn (ShopPickListRowDTO $row) => $row->collection_status === $status->value)
            ->sortBy(static fn (ShopPickListRowDTO $row) => mb_strtolower($row->student_name))
            ->values();
    }
}
