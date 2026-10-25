<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Admin\ColouringPages;

use HiEvents\DomainObjects\Enums\Role;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\ColouringPage\ReorderColouringPagesRequest;
use HiEvents\Services\Application\Handlers\ColouringPage\ReorderColouringPagesHandler;
use Illuminate\Http\Response;
use Throwable;

class ReorderSharedColouringPagesAction extends BaseAction
{
    public function __construct(
        private readonly ReorderColouringPagesHandler $handler,
    ) {}

    /**
     * @throws ResourceNotFoundException
     * @throws Throwable
     */
    public function __invoke(ReorderColouringPagesRequest $request): Response
    {
        $this->minimumAllowedRole(Role::SUPERADMIN);

        $this->handler->handle(null, array_map('intval', $request->validated('page_ids')));

        return $this->noContentResponse();
    }
}
