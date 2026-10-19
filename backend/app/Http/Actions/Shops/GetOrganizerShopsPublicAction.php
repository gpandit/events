<?php

namespace HiEvents\Http\Actions\Shops;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\Event\EventResourcePublic;
use HiEvents\Services\Application\Handlers\Event\DTO\GetPublicOrganizerEventsDTO;
use HiEvents\Services\Application\Handlers\Event\GetPublicEventsHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetOrganizerShopsPublicAction extends BaseAction
{
    public function __construct(
        private readonly GetPublicEventsHandler $handler,
    ) {}

    public function __invoke(int $organizerId, Request $request): JsonResponse
    {
        $shops = $this->handler->handle(new GetPublicOrganizerEventsDTO(
            organizerId: $organizerId,
            queryParams: $this->getPaginationQueryParams($request),
            authenticatedAccountId: $this->isUserAuthenticated() ? $this->getAuthenticatedAccountId() : null,
            isShop: true,
        ));

        return $this->resourceResponse(
            resource: EventResourcePublic::class,
            data: $shops,
        );
    }
}
