<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Generated\ChildStorySubmissionDomainObjectAbstract;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use Illuminate\Support\Carbon;

class ReviewChildStorySubmissionHandler
{
    public function __construct(
        private readonly ChildStorySubmissionRepositoryInterface $repository,
    ) {}

    /**
     * @throws ResourceNotFoundException
     */
    public function handle(int $submissionId, int $organizerId, ChildStorySubmissionStatus $status): ChildStorySubmissionDomainObject
    {
        $submission = $this->repository->findFirstWhere([
            ChildStorySubmissionDomainObjectAbstract::ID => $submissionId,
            ChildStorySubmissionDomainObjectAbstract::ORGANIZER_ID => $organizerId,
        ]);

        if ($submission === null) {
            throw new ResourceNotFoundException(__('Submission not found'));
        }

        /** @var ChildStorySubmissionDomainObject $updated */
        $updated = $this->repository->updateFromArray($submissionId, [
            ChildStorySubmissionDomainObjectAbstract::STATUS => $status->value,
            ChildStorySubmissionDomainObjectAbstract::REVIEWED_AT => Carbon::now(),
            ChildStorySubmissionDomainObjectAbstract::PUBLISHED_AT => $status === ChildStorySubmissionStatus::APPROVED
                ? Carbon::now()
                : null,
        ]);

        return $updated;
    }
}
