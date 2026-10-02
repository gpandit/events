<?php

declare(strict_types=1);

namespace HiEvents\Repository\Interfaces;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\Http\DTO\QueryParamsDTO;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @extends RepositoryInterface<ChildStorySubmissionDomainObject>
 */
interface ChildStorySubmissionRepositoryInterface extends RepositoryInterface
{
    public function findByOrganizerId(int $organizerId, QueryParamsDTO $params, ?string $status): LengthAwarePaginator;

    public function findPublishedByOrganizerId(int $organizerId, QueryParamsDTO $params): LengthAwarePaginator;
}
