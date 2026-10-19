<?php

namespace HiEvents\Http\Actions\Shops;

use HiEvents\DomainObjects\Enums\CollectionStatus;
use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\Shop\GetShopPickListHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetShopPickListAction extends BaseAction
{
    public function __construct(
        private readonly GetShopPickListHandler $handler,
    ) {}

    public function __invoke(Request $request, int $eventId): JsonResponse
    {
        $this->isActionAuthorized($eventId, EventDomainObject::class);

        $status = CollectionStatus::tryFrom((string) $request->query('collection_status')) ?? CollectionStatus::PENDING;

        return $this->jsonResponse(
            $this->handler->handle($eventId, $status)->map->toArray()->all(),
            wrapInData: true,
        );
    }
}
