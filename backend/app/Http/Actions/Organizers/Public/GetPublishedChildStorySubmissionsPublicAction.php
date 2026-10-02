<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\DTO\QueryParamsDTO;
use HiEvents\Resources\ChildStorySubmission\PublishedChildStorySubmissionResource;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\GetPublishedChildStorySubmissionsHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetPublishedChildStorySubmissionsPublicAction extends BaseAction
{
    public function __construct(
        private readonly GetPublishedChildStorySubmissionsHandler $handler,
    ) {}

    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $submissions = $this->handler->handle(
            organizerId: $organizerId,
            params: QueryParamsDTO::fromArray($request->query->all()),
        );

        return $this->resourceResponse(
            resource: PublishedChildStorySubmissionResource::class,
            data: $submissions,
        );
    }
}
