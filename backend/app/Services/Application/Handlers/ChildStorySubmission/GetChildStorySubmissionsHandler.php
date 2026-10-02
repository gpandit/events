<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ChildStorySubmission;

use HiEvents\Http\DTO\QueryParamsDTO;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class GetChildStorySubmissionsHandler
{
    public function __construct(
        private readonly ChildStorySubmissionRepositoryInterface $repository,
    ) {}

    public function handle(int $organizerId, QueryParamsDTO $params, ?string $status): LengthAwarePaginator
    {
        return $this->repository->findByOrganizerId($organizerId, $params, $status);
    }
}
