<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\ColouringPages;

use HiEvents\DomainObjects\Enums\ColouringPageAgeGroup;
use HiEvents\DomainObjects\Enums\ColouringPageTint;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\Status\ColouringPageStatus;
use HiEvents\Exceptions\CouldNotStoreColouringPageFilesException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\ColouringPage\CreateColouringPageRequest;
use HiEvents\Resources\ColouringPage\ColouringPageResource;
use HiEvents\Services\Application\Handlers\ColouringPage\CreateColouringPageHandler;
use HiEvents\Services\Application\Handlers\ColouringPage\DTO\CreateColouringPageDTO;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Throwable;

class CreateColouringPageAction extends BaseAction
{
    public function __construct(
        private readonly CreateColouringPageHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     * @throws Throwable
     */
    public function __invoke(CreateColouringPageRequest $request, int $organizerId): JsonResponse
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class);

        try {
            $page = $this->handler->handle(new CreateColouringPageDTO(
                organizerId: $organizerId,
                title: $request->validated('title'),
                ageGroup: ColouringPageAgeGroup::from($request->validated('age_group')),
                tint: ColouringPageTint::from($request->validated('tint')),
                status: ColouringPageStatus::from($request->validated('status')),
                pdf: $request->file('pdf'),
                thumbnail: $request->file('thumbnail'),
            ));
        } catch (CouldNotStoreColouringPageFilesException $exception) {
            throw ValidationException::withMessages(['pdf' => $exception->getMessage()]);
        }

        return $this->resourceResponse(
            resource: ColouringPageResource::class,
            data: $page,
            statusCode: Response::HTTP_CREATED,
        );
    }
}
