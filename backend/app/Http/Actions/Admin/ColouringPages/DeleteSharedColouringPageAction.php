<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Admin\ColouringPages;

use HiEvents\DomainObjects\Enums\Role;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\ColouringPage\DeleteColouringPageHandler;
use Illuminate\Http\Response;

class DeleteSharedColouringPageAction extends BaseAction
{
    public function __construct(
        private readonly DeleteColouringPageHandler $handler,
    ) {}

    /**
     * @throws ResourceNotFoundException
     */
    public function __invoke(int $pageId): Response
    {
        $this->minimumAllowedRole(Role::SUPERADMIN);

        $this->handler->handle($pageId, null);

        return $this->deletedResponse();
    }
}
