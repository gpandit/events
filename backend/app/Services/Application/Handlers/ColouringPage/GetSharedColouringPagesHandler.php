<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ColouringPage;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use Illuminate\Support\Collection;

class GetSharedColouringPagesHandler
{
    public function __construct(
        private readonly ColouringPageRepositoryInterface $repository,
    ) {}

    /**
     * @return Collection<int, ColouringPageDomainObject>
     */
    public function handle(): Collection
    {
        return $this->repository->findOwnedBy(null);
    }
}
