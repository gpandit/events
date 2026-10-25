<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Admin\ColouringPages;

use HiEvents\DomainObjects\Enums\Role;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\ColouringPage\ColouringPageResource;
use HiEvents\Services\Application\Handlers\ColouringPage\GetSharedColouringPagesHandler;
use Illuminate\Http\JsonResponse;

class GetSharedColouringPagesAction extends BaseAction
{
    public function __construct(
        private readonly GetSharedColouringPagesHandler $handler,
    ) {}

    public function __invoke(): JsonResponse
    {
        $this->minimumAllowedRole(Role::SUPERADMIN);

        return $this->resourceResponse(
            resource: ColouringPageResource::class,
            data: $this->handler->handle(),
        );
    }
}
