<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\ColouringPage\PublicColouringPageResource;
use HiEvents\Services\Application\Handlers\ColouringPage\GetColouringPagesHandler;
use Illuminate\Http\JsonResponse;

class GetPublishedColouringPagesPublicAction extends BaseAction
{
    public function __construct(
        private readonly GetColouringPagesHandler $handler,
    ) {}

    public function __invoke(int $organizerId): JsonResponse
    {
        return $this->resourceResponse(
            resource: PublicColouringPageResource::class,
            data: $this->handler->handle($organizerId, publishedOnly: true),
        );
    }
}
