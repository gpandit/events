<?php

namespace HiEvents\Services\Application\Handlers\Shop;

use HiEvents\Exceptions\EventNotAShopException;
use HiEvents\Services\Domain\Shop\ShopOrderCollectionService;

class MarkOrdersCollectedHandler
{
    public function __construct(
        private readonly ShopOrderCollectionService $collectionService,
    ) {}

    /**
     * @param  array<int, int>  $orderIds
     *
     * @throws EventNotAShopException
     */
    public function handle(int $eventId, array $orderIds): int
    {
        return $this->collectionService->markCollected($eventId, $orderIds);
    }
}
