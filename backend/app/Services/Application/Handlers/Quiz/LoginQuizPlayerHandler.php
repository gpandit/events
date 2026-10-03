<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\Generated\QuizPlayerDomainObjectAbstract;
use HiEvents\Exceptions\InvalidCredentialsException;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\LoginQuizPlayerDTO;
use HiEvents\Services\Application\Handlers\Quiz\DTO\QuizPlayerSessionDTO;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use Illuminate\Contracts\Hashing\Hasher;

class LoginQuizPlayerHandler
{
    public function __construct(
        private readonly QuizPlayerRepositoryInterface $playerRepository,
        private readonly QuizPlayerSessionService $sessionService,
        private readonly Hasher $hasher,
    ) {}

    /**
     * @throws InvalidCredentialsException
     */
    public function handle(LoginQuizPlayerDTO $dto): QuizPlayerSessionDTO
    {
        $username = mb_strtolower(trim($dto->username));

        $player = $this->playerRepository->findFirstWhere([
            QuizPlayerDomainObjectAbstract::ORGANIZER_ID => $dto->organizer_id,
            fn ($query) => $query->whereRaw('LOWER(username) = ?', [$username]),
        ]);

        if ($player === null || ! $this->hasher->check($dto->password, $player->getPassword())) {
            throw new InvalidCredentialsException;
        }

        return new QuizPlayerSessionDTO(
            username: $player->getUsername(),
            token: $this->sessionService->issueToken($player),
        );
    }
}
