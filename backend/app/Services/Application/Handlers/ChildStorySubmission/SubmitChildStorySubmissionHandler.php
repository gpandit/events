<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Enums\ChildStorySubmissionType;
use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\Generated\ChildStorySubmissionDomainObjectAbstract;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use HiEvents\Helper\Url;
use HiEvents\Mail\ChildStory\ChildStoryParentConsentEmail;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\DTO\SubmitChildStorySubmissionDTO;
use HiEvents\Services\Domain\ParentalConsent\ParentalConsentService;
use HiEvents\Services\Infrastructure\HtmlPurifier\HtmlPurifierService;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Support\Carbon;

class SubmitChildStorySubmissionHandler
{
    public function __construct(
        private readonly ChildStorySubmissionRepositoryInterface $repository,
        private readonly HtmlPurifierService $purifier,
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly ParentalConsentService $parentalConsentService,
        private readonly Mailer $mailer,
    ) {}

    public function handle(SubmitChildStorySubmissionDTO $dto): ChildStorySubmissionDomainObject
    {
        $submittedAt = Carbon::now();

        /** @var ChildStorySubmissionDomainObject $submission */
        $submission = $this->repository->create([
            ChildStorySubmissionDomainObjectAbstract::ORGANIZER_ID => $dto->organizer_id,
            ChildStorySubmissionDomainObjectAbstract::TYPE => $dto->type,
            ChildStorySubmissionDomainObjectAbstract::FIRST_NAME => $dto->first_name,
            ChildStorySubmissionDomainObjectAbstract::LAST_NAME => $dto->last_name,
            ChildStorySubmissionDomainObjectAbstract::YEAR_GROUP => $dto->year_group,
            ChildStorySubmissionDomainObjectAbstract::CONTENT => $this->purifier->purify($dto->content),
            ChildStorySubmissionDomainObjectAbstract::ORIGINAL_FILENAME => $dto->original_filename,
            ChildStorySubmissionDomainObjectAbstract::CONSENT_OWN_WORK => $dto->consent_own_work,
            ChildStorySubmissionDomainObjectAbstract::CONSENT_PUBLISH => $dto->consent_publish,
            ChildStorySubmissionDomainObjectAbstract::STATUS => ChildStorySubmissionStatus::PENDING->value,
            ChildStorySubmissionDomainObjectAbstract::SUBMITTED_AT => $submittedAt,
        ]);

        if ($dto->consent_publish && $dto->parent_email !== null) {
            $this->requestParentalConsent($submission, $dto->parent_email, $submittedAt);
        }

        return $submission;
    }

    private function requestParentalConsent(
        ChildStorySubmissionDomainObject $submission,
        string $parentEmail,
        Carbon $submittedAt,
    ): void {
        $organizer = $this->organizerRepository->findById($submission->getOrganizerId());

        $token = $this->parentalConsentService->request(
            organizerId: $submission->getOrganizerId(),
            subject: ParentalConsentSubject::CHILD_STORY,
            subjectId: $submission->getId(),
            parentEmail: $parentEmail,
        );

        $this->mailer
            ->to($parentEmail)
            ->queue(new ChildStoryParentConsentEmail(
                childFirstName: $submission->getFirstName(),
                childLastInitial: $submission->getLastInitial().'.',
                workType: $submission->getType() === ChildStorySubmissionType::POEM->value ? __('poem') : __('story'),
                yearGroup: $submission->getYearGroup(),
                submittedOn: $submittedAt->translatedFormat('j F Y'),
                organizerName: $organizer->getName(),
                consentUrl: sprintf(
                    Url::getFrontEndUrlFromConfig(Url::PARENTAL_CONSENT),
                    $organizer->getId(),
                    $organizer->getSlug(),
                    $token,
                ),
                validDays: ParentalConsentService::LIFETIME_DAYS,
            ));
    }
}
