<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Generated\ChildStorySubmissionDomainObjectAbstract;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use HiEvents\Http\DTO\QueryParamsDTO;
use HiEvents\Models\ChildStorySubmission;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepository<ChildStorySubmissionDomainObject>
 */
class ChildStorySubmissionRepository extends BaseRepository implements ChildStorySubmissionRepositoryInterface
{
    protected function getModel(): string
    {
        return ChildStorySubmission::class;
    }

    public function getDomainObject(): string
    {
        return ChildStorySubmissionDomainObject::class;
    }

    public function findByOrganizerId(int $organizerId, QueryParamsDTO $params, ?string $status): LengthAwarePaginator
    {
        $where = [
            [ChildStorySubmissionDomainObjectAbstract::ORGANIZER_ID, '=', $organizerId],
        ];

        if ($status !== null) {
            $where[] = [ChildStorySubmissionDomainObjectAbstract::STATUS, '=', $status];
        }

        $this->model = $this->model->orderBy(ChildStorySubmissionDomainObjectAbstract::SUBMITTED_AT, 'desc');

        return $this->paginateWhere(
            where: $where,
            limit: $params->per_page,
            page: $params->page,
        );
    }

    public function findPublishedByOrganizerId(int $organizerId, QueryParamsDTO $params): LengthAwarePaginator
    {
        $where = [
            [ChildStorySubmissionDomainObjectAbstract::ORGANIZER_ID, '=', $organizerId],
            [ChildStorySubmissionDomainObjectAbstract::STATUS, '=', ChildStorySubmissionStatus::APPROVED->value],
        ];

        $this->model = $this->model->orderBy(ChildStorySubmissionDomainObjectAbstract::PUBLISHED_AT, 'desc');

        return $this->paginateWhere(
            where: $where,
            limit: $params->per_page,
            page: $params->page,
        );
    }
}
