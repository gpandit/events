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
    public function findVisibleToOrganizer(int $organizerId, ?string $status = null): Collection;

    /**
     * @return Collection<int, ColouringPageDomainObject>
     */
    public function findOwnedBy(?int $organizerId, ?string $status = null): Collection;

    public function findOwnedPage(int $pageId, ?int $organizerId): ?ColouringPageDomainObject;

    /**
     * @param  int[]  $pageIds
     * @return Collection<int, ColouringPageDomainObject>
     */
    public function findOwnedPages(array $pageIds, ?int $organizerId): Collection;

    public function findNextSortOrder(?int $organizerId): int;
}
