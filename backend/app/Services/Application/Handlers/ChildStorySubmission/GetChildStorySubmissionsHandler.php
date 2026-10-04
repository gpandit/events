<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\Http\DTO\QueryParamsDTO;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use HiEvents\Services\Domain\ParentalConsent\ParentalConsentService;
use Illuminate\Pagination\LengthAwarePaginator;

class GetChildStorySubmissionsHandler
{
    public function __construct(
        private readonly ChildStorySubmissionRepositoryInterface $repository,
        private readonly ParentalConsentService $parentalConsentService,
    ) {}

    public function handle(int $organizerId, QueryParamsDTO $params, ?string $status): LengthAwarePaginator
    {
        $submissions = $this->repository->findByOrganizerId($organizerId, $params, $status);

        $consents = $this->parentalConsentService->findForSubjects(
            ParentalConsentSubject::CHILD_STORY,
            $submissions->getCollection()->map(fn (ChildStorySubmissionDomainObject $submission) => $submission->getId())->all(),
        );

        $submissions->getCollection()->each(
            fn (ChildStorySubmissionDomainObject $submission) => $submission->setParentalConsent($consents->get($submission->getId()))
        );

        return $submissions;
    }
}
