<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\Generated\ChildStorySubmissionDomainObjectAbstract;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use HiEvents\Exceptions\ChildStoryPublicationNotPermittedException;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use HiEvents\Services\Domain\ParentalConsent\ParentalConsentService;
use Illuminate\Support\Carbon;

class ReviewChildStorySubmissionHandler
{
    public function __construct(
        private readonly ChildStorySubmissionRepositoryInterface $repository,
        private readonly ParentalConsentService $parentalConsentService,
    ) {}

    /**
     * @throws ResourceNotFoundException
     * @throws ChildStoryPublicationNotPermittedException
     */
    public function handle(int $submissionId, int $organizerId, ChildStorySubmissionStatus $status): ChildStorySubmissionDomainObject
    {
        /** @var ChildStorySubmissionDomainObject|null $submission */
        $submission = $this->repository->findFirstWhere([
            ChildStorySubmissionDomainObjectAbstract::ID => $submissionId,
            ChildStorySubmissionDomainObjectAbstract::ORGANIZER_ID => $organizerId,
        ]);

        if ($submission === null) {
            throw new ResourceNotFoundException(__('Submission not found'));
        }

        if ($status === ChildStorySubmissionStatus::APPROVED) {
            $this->assertPublishable($submission);
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

    /**
     * @throws ChildStoryPublicationNotPermittedException
     */
    private function assertPublishable(ChildStorySubmissionDomainObject $submission): void
    {
        if (! $submission->getConsentPublish()) {
            throw new ChildStoryPublicationNotPermittedException(__('The author did not agree to have this work published.'));
        }

        $parentalConsent = $this->parentalConsentService->findForSubject(
            ParentalConsentSubject::CHILD_STORY,
            $submission->getId(),
        );

        if ($parentalConsent !== null && ! $parentalConsent->isGranted()) {
            throw new ChildStoryPublicationNotPermittedException(__('A parent or guardian has not given permission to publish this work.'));
        }
    }
}
