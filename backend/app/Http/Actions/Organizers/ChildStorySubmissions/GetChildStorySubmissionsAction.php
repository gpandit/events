<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\ChildStorySubmissions;

use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\DTO\QueryParamsDTO;
use HiEvents\Resources\ChildStorySubmission\ChildStorySubmissionResource;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\GetChildStorySubmissionsHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetChildStorySubmissionsAction extends BaseAction
{
    public function __construct(
        private readonly GetChildStorySubmissionsHandler $handler,
    ) {}

    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class);

        $submissions = $this->handler->handle(
            organizerId: $organizerId,
            params: QueryParamsDTO::fromArray($request->query->all()),
            status: $request->query('status'),
        );

        return $this->resourceResponse(
            resource: ChildStorySubmissionResource::class,
            data: $submissions,
        );
    }
}
