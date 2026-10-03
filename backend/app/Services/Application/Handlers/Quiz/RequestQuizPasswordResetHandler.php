<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\Enums\PasswordSetupSubject;
use HiEvents\DomainObjects\Generated\QuizPlayerDomainObjectAbstract;
use HiEvents\Helper\Url;
use HiEvents\Mail\Quiz\QuizPasswordResetEmail;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RequestQuizPasswordResetDTO;
use HiEvents\Services\Domain\PasswordSetup\PasswordSetupTokenService;
use Illuminate\Contracts\Mail\Mailer;

class RequestQuizPasswordResetHandler
{
    public function __construct(
        private readonly QuizPlayerRepositoryInterface $playerRepository,
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly PasswordSetupTokenService $tokenService,
        private readonly Mailer $mailer,
    ) {}

    public function handle(RequestQuizPasswordResetDTO $dto): void
    {
        $username = mb_strtolower(trim($dto->username));

        $player = $this->playerRepository->findFirstWhere([
            QuizPlayerDomainObjectAbstract::ORGANIZER_ID => $dto->organizer_id,
            fn ($query) => $query->whereRaw('LOWER(username) = ?', [$username]),
        ]);

        if ($player === null || ! $player->getEmail()) {
            return;
        }

        $organizer = $this->organizerRepository->findById($dto->organizer_id);
        $token = $this->tokenService->issue(PasswordSetupSubject::QUIZ_PLAYER, $player->getId());

        $this->mailer
            ->to($player->getEmail())
            ->queue(new QuizPasswordResetEmail(
                username: $player->getUsername(),
                organizerName: $organizer->getName(),
                resetUrl: sprintf(
                    Url::getFrontEndUrlFromConfig(Url::QUIZ_PASSWORD_RESET),
                    $organizer->getId(),
                    $organizer->getSlug(),
                    $token,
                ),
            ));
    }
}
