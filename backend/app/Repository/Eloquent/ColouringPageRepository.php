<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\DomainObjects\Generated\ColouringPageDomainObjectAbstract;
use HiEvents\Models\ColouringPage;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
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

    public function findByOrganizerId(int $organizerId, ?string $status = null): Collection
    {
        $where = [
            [ColouringPageDomainObjectAbstract::ORGANIZER_ID, '=', $organizerId],
        ];

        if ($status !== null) {
            $where[] = [ColouringPageDomainObjectAbstract::STATUS, '=', $status];
        }

        return $this->runQuery(function () use ($where) {
            $this->applyConditions($where);

            return $this->handleResults(
                $this->model
                    ->orderBy(ColouringPageDomainObjectAbstract::SORT_ORDER)
                    ->orderBy(ColouringPageDomainObjectAbstract::ID)
                    ->get()
            );
        });
    }

    public function findNextSortOrder(int $organizerId): int
    {
        return $this->runQuery(function () use ($organizerId) {
            $max = $this->model
                ->where(ColouringPageDomainObjectAbstract::ORGANIZER_ID, $organizerId)
                ->max(ColouringPageDomainObjectAbstract::SORT_ORDER);

            return $max === null ? 0 : (int) $max + 1;
        });
    }
}
