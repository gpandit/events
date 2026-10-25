<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\ColouringPages;

use HiEvents\DomainObjects\Enums\Role;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\ColouringPage\ReorderColouringPagesRequest;
use HiEvents\Services\Application\Handlers\ColouringPage\ReorderColouringPagesHandler;
use Illuminate\Http\Response;
use Throwable;

class ReorderColouringPagesAction extends BaseAction
{
    public function __construct(
        private readonly ReorderColouringPagesHandler $handler,
    ) {}

    /**
     * @throws ResourceNotFoundException
     * @throws Throwable
     */
    public function __invoke(ReorderColouringPagesRequest $request, int $organizerId): Response
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class, Role::ADMIN);

        $this->handler->handle($organizerId, array_map('intval', $request->validated('page_ids')));

        return $this->noContentResponse();
    }
}
