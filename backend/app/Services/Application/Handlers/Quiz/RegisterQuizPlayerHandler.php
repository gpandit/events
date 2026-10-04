<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\Generated\QuizPlayerDomainObjectAbstract;
use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Helper\Url;
use HiEvents\Mail\Quiz\QuizParentConsentEmail;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\QuizPlayerSessionDTO;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RegisterQuizPlayerDTO;
use HiEvents\Services\Domain\ParentalConsent\ParentalConsentService;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use HiEvents\Services\Domain\Quiz\QuizUsernameGenerator;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Contracts\Mail\Mailer;

class RegisterQuizPlayerHandler
{
    public function __construct(
        private readonly QuizPlayerRepositoryInterface $playerRepository,
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly QuizUsernameGenerator $usernameGenerator,
        private readonly QuizPlayerSessionService $sessionService,
        private readonly ParentalConsentService $parentalConsentService,
        private readonly Hasher $hasher,
        private readonly Mailer $mailer,
    ) {}

    public function handle(RegisterQuizPlayerDTO $dto): QuizPlayerSessionDTO
    {
        /** @var QuizPlayerDomainObject $player */
        $player = $this->playerRepository->create([
            QuizPlayerDomainObjectAbstract::ORGANIZER_ID => $dto->organizer_id,
            QuizPlayerDomainObjectAbstract::USERNAME => $this->usernameGenerator->generate($dto->organizer_id),
            QuizPlayerDomainObjectAbstract::FIRST_NAME => trim($dto->first_name),
            QuizPlayerDomainObjectAbstract::EMAIL => mb_strtolower(trim($dto->email)),
            QuizPlayerDomainObjectAbstract::AGE_BAND => $dto->age_band->value,
            QuizPlayerDomainObjectAbstract::PASSWORD => $this->hasher->make($dto->password),
        ]);

        if ($dto->age_band->requiresParentalConsent() && $dto->parent_email !== null) {
            $this->requestParentalConsent($player, $dto->parent_email);
        }

        return new QuizPlayerSessionDTO(
            username: $player->getUsername(),
            token: $this->sessionService->issueToken($player),
        );
    }

    private function requestParentalConsent(QuizPlayerDomainObject $player, string $parentEmail): void
    {
        $organizer = $this->organizerRepository->findById($player->getOrganizerId());

        $token = $this->parentalConsentService->request(
            organizerId: $player->getOrganizerId(),
            subject: ParentalConsentSubject::QUIZ_PLAYER,
            subjectId: $player->getId(),
            parentEmail: $parentEmail,
        );

        $this->mailer
            ->to($parentEmail)
            ->queue(new QuizParentConsentEmail(
                childFirstName: $player->getFirstName(),
                username: $player->getUsername(),
                ageGroup: $player->getAgeBand(),
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
