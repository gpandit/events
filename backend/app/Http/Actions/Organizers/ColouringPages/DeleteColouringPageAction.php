<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\ColouringPages;

use HiEvents\DomainObjects\Enums\Role;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\ColouringPage\DeleteColouringPageHandler;
use Illuminate\Http\Response;

class DeleteColouringPageAction extends BaseAction
{
    public function __construct(
        private readonly DeleteColouringPageHandler $handler,
    ) {}

    /**
     * @throws ResourceNotFoundException
     */
    public function __invoke(int $organizerId, int $pageId): Response
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class, Role::ADMIN);

        $this->handler->handle($pageId, $organizerId);

        return $this->deletedResponse();
    }
}
