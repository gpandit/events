<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ParentalConsent;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\ParentalConsentDomainObject;
use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Exceptions\InvalidParentalConsentTokenException;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\ParentalConsent\DTO\ParentalConsentDetailsDTO;
use HiEvents\Services\Domain\ParentalConsent\ParentalConsentService;

class GetParentalConsentHandler
{
    public function __construct(
        private readonly ParentalConsentService $parentalConsentService,
        private readonly ChildStorySubmissionRepositoryInterface $storyRepository,
        private readonly QuizPlayerRepositoryInterface $playerRepository,
        private readonly OrganizerRepositoryInterface $organizerRepository,
    ) {}

    /**
     * @throws InvalidParentalConsentTokenException
     */
    public function handle(int $organizerId, string $token): ParentalConsentDetailsDTO
    {
        $consent = $this->parentalConsentService->findByToken($organizerId, $token);

        return $consent->getSubjectType() === ParentalConsentSubject::CHILD_STORY->value
            ? $this->storyDetails($consent)
            : $this->quizPlayerDetails($consent);
    }

    /**
     * @throws InvalidParentalConsentTokenException
     */
    private function storyDetails(ParentalConsentDomainObject $consent): ParentalConsentDetailsDTO
    {
        /** @var ChildStorySubmissionDomainObject|null $submission */
        $submission = $this->storyRepository->findById($consent->getSubjectId());

        if ($submission === null) {
            throw new InvalidParentalConsentTokenException(__('This link is invalid. Please check the link in the email we sent you.'));
        }

        return new ParentalConsentDetailsDTO(
            subject_type: $consent->getSubjectType(),
            status: $consent->getStatus(),
            is_expired: $consent->isExpired(),
            organizer_name: $this->organizerName($consent),
            child_first_name: $submission->getFirstName(),
            work_type: $submission->getType(),
            child_last_initial: $submission->getLastInitial(),
            year_group: $submission->getYearGroup(),
            content: $submission->getContent(),
            submitted_at: $submission->getSubmittedAt(),
        );
    }

    /**
     * @throws InvalidParentalConsentTokenException
     */
    private function quizPlayerDetails(ParentalConsentDomainObject $consent): ParentalConsentDetailsDTO
    {
        /** @var QuizPlayerDomainObject|null $player */
        $player = $this->playerRepository->findById($consent->getSubjectId());

        if ($player === null) {
            throw new InvalidParentalConsentTokenException(__('This link is invalid. Please check the link in the email we sent you.'));
        }

        return new ParentalConsentDetailsDTO(
            subject_type: $consent->getSubjectType(),
            status: $consent->getStatus(),
            is_expired: $consent->isExpired(),
            organizer_name: $this->organizerName($consent),
            child_first_name: $player->getFirstName(),
            username: $player->getUsername(),
            age_band: $player->getAgeBand(),
        );
    }

    private function organizerName(ParentalConsentDomainObject $consent): string
    {
        return $this->organizerRepository->findById($consent->getOrganizerId())->getName();
    }
}
