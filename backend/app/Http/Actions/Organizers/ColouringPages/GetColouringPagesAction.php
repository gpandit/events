<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\ColouringPages;

use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\ColouringPage\ColouringPageResource;
use HiEvents\Services\Application\Handlers\ColouringPage\GetColouringPagesHandler;
use Illuminate\Http\JsonResponse;

class GetColouringPagesAction extends BaseAction
{
    public function __construct(
        private readonly GetColouringPagesHandler $handler,
    ) {}

    public function __invoke(int $organizerId): JsonResponse
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class);

        return $this->resourceResponse(
            resource: ColouringPageResource::class,
            data: $this->handler->handle($organizerId),
        );
    }
}
