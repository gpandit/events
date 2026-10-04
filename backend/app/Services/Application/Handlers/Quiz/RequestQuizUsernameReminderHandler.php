<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\Generated\QuizPlayerDomainObjectAbstract;
use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Mail\Quiz\QuizUsernameReminderEmail;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RequestQuizUsernameReminderDTO;
use Illuminate\Contracts\Mail\Mailer;

class RequestQuizUsernameReminderHandler
{
    public function __construct(
        private readonly QuizPlayerRepositoryInterface $playerRepository,
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly Mailer $mailer,
    ) {}

    public function handle(RequestQuizUsernameReminderDTO $dto): void
    {
        $email = mb_strtolower(trim($dto->email));

        $players = $this->playerRepository->findWhere([
            QuizPlayerDomainObjectAbstract::ORGANIZER_ID => $dto->organizer_id,
            fn ($query) => $query->whereRaw('LOWER(email) = ?', [$email]),
        ]);

        if ($players->isEmpty()) {
            return;
        }

        $organizer = $this->organizerRepository->findById($dto->organizer_id);

        $this->mailer
            ->to($email)
            ->queue(new QuizUsernameReminderEmail(
                usernames: $players->map(fn (QuizPlayerDomainObject $player) => $player->getUsername())->all(),
                organizerName: $organizer->getName(),
            ));
    }
}
