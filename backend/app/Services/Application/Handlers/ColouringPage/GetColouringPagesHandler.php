<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ColouringPage;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\DomainObjects\Status\ColouringPageStatus;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use Illuminate\Support\Collection;

class GetColouringPagesHandler
{
    public function __construct(
        private readonly ColouringPageRepositoryInterface $repository,
    ) {}

    /**
     * @return Collection<int, ColouringPageDomainObject>
     */
    public function handle(int $organizerId, bool $publishedOnly = false): Collection
    {
        return $this->repository->findVisibleToOrganizer(
            $organizerId,
            $publishedOnly ? ColouringPageStatus::PUBLISHED->value : null,
        );
    }
}
