<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\DomainObjects\Generated\ColouringPageDomainObjectAbstract;
use HiEvents\Models\ColouringPage;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * @extends BaseRepository<ColouringPageDomainObject>
 */
class ColouringPageRepository extends BaseRepository implements ColouringPageRepositoryInterface
{
    protected function getModel(): string
    {
        return ColouringPage::class;
    }

    public function getDomainObject(): string
    {
        return ColouringPageDomainObject::class;
    }

    public function findVisibleToOrganizer(int $organizerId, ?string $status = null): Collection
    {
        return $this->runQuery(function () use ($organizerId, $status) {
            $query = $this->model
                ->where(function ($query) use ($organizerId) {
                    $query->where(ColouringPageDomainObjectAbstract::ORGANIZER_ID, $organizerId)
                        ->orWhereNull(ColouringPageDomainObjectAbstract::ORGANIZER_ID);
                });

            if ($status !== null) {
                $query->where(ColouringPageDomainObjectAbstract::STATUS, $status);
            }

            return $this->handleResults(
                $query
                    ->orderByRaw(ColouringPageDomainObjectAbstract::ORGANIZER_ID.' IS NULL')
                    ->orderBy(ColouringPageDomainObjectAbstract::SORT_ORDER)
                    ->orderBy(ColouringPageDomainObjectAbstract::ID)
                    ->get()
            );
        });
    }

    public function findOwnedBy(?int $organizerId, ?string $status = null): Collection
    {
        return $this->runQuery(function () use ($organizerId, $status) {
            $query = $this->ownedBy($organizerId);

            if ($status !== null) {
                $query->where(ColouringPageDomainObjectAbstract::STATUS, $status);
            }

            return $this->handleResults(
                $query
                    ->orderBy(ColouringPageDomainObjectAbstract::SORT_ORDER)
                    ->orderBy(ColouringPageDomainObjectAbstract::ID)
                    ->get()
            );
        });
    }

    public function findOwnedPage(int $pageId, ?int $organizerId): ?ColouringPageDomainObject
    {
        return $this->runQuery(function () use ($pageId, $organizerId) {
            return $this->handleSingleResult(
                $this->ownedBy($organizerId)->where(ColouringPageDomainObjectAbstract::ID, $pageId)->first()
            );
        });
    }

    public function findOwnedPages(array $pageIds, ?int $organizerId): Collection
    {
        return $this->runQuery(function () use ($pageIds, $organizerId) {
            return $this->handleResults(
                $this->ownedBy($organizerId)->whereIn(ColouringPageDomainObjectAbstract::ID, $pageIds)->get()
            );
        });
    }

    public function findNextSortOrder(?int $organizerId): int
    {
        return $this->runQuery(function () use ($organizerId) {
            $max = $this->ownedBy($organizerId)->max(ColouringPageDomainObjectAbstract::SORT_ORDER);

            return $max === null ? 0 : (int) $max + 1;
        });
    }

    private function ownedBy(?int $organizerId): Builder
    {
        return $organizerId === null
            ? $this->model->whereNull(ColouringPageDomainObjectAbstract::ORGANIZER_ID)
            : $this->model->where(ColouringPageDomainObjectAbstract::ORGANIZER_ID, $organizerId);
    }
}
