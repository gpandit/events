<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Admin\ColouringPages;

use HiEvents\DomainObjects\Enums\ColouringPageAgeGroup;
use HiEvents\DomainObjects\Enums\ColouringPageTint;
use HiEvents\DomainObjects\Enums\Role;
use HiEvents\DomainObjects\Status\ColouringPageStatus;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\ColouringPage\UpdateColouringPageRequest;
use HiEvents\Resources\ColouringPage\ColouringPageResource;
use HiEvents\Services\Application\Handlers\ColouringPage\DTO\UpdateColouringPageDTO;
use HiEvents\Services\Application\Handlers\ColouringPage\UpdateColouringPageHandler;
use Illuminate\Http\JsonResponse;

class UpdateSharedColouringPageAction extends BaseAction
{
    public function __construct(
        private readonly UpdateColouringPageHandler $handler,
    ) {}

    /**
     * @throws ResourceNotFoundException
     */
    public function __invoke(UpdateColouringPageRequest $request, int $pageId): JsonResponse
    {
        $this->minimumAllowedRole(Role::SUPERADMIN);

        $page = $this->handler->handle(new UpdateColouringPageDTO(
            organizerId: null,
            pageId: $pageId,
            title: $request->validated('title'),
            ageGroup: ColouringPageAgeGroup::from($request->validated('age_group')),
            tint: ColouringPageTint::from($request->validated('tint')),
            status: ColouringPageStatus::from($request->validated('status')),
        ));

        return $this->resourceResponse(
            resource: ColouringPageResource::class,
            data: $page,
        );
    }
}
