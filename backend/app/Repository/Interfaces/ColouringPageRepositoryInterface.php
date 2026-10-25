<?php

declare(strict_types=1);

namespace HiEvents\Repository\Interfaces;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use Illuminate\Support\Collection;

/**
 * @extends RepositoryInterface<ColouringPageDomainObject>
 */
interface ColouringPageRepositoryInterface extends RepositoryInterface
{
    /**
     * @return Collection<int, ColouringPageDomainObject>
     */
    public function findByOrganizerId(int $organizerId, ?string $status = null): Collection;

    public function findNextSortOrder(int $organizerId): int;
}
