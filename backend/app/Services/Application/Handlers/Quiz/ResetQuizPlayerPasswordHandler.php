<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\Enums\PasswordSetupSubject;
use HiEvents\DomainObjects\Generated\QuizPlayerDomainObjectAbstract;
use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Exceptions\InvalidPasswordSetupTokenException;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\QuizPlayerSessionDTO;
use HiEvents\Services\Application\Handlers\Quiz\DTO\ResetQuizPlayerPasswordDTO;
use HiEvents\Services\Domain\PasswordSetup\PasswordSetupTokenService;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use Illuminate\Contracts\Hashing\Hasher;

class ResetQuizPlayerPasswordHandler
{
    public function __construct(
        private readonly PasswordSetupTokenService $tokenService,
        private readonly QuizPlayerRepositoryInterface $playerRepository,
        private readonly QuizPlayerSessionService $sessionService,
        private readonly Hasher $hasher,
    ) {}

    /**
     * @throws InvalidPasswordSetupTokenException
     */
    public function handle(ResetQuizPlayerPasswordDTO $dto): QuizPlayerSessionDTO
    {
        $playerId = $this->tokenService->consume(PasswordSetupSubject::QUIZ_PLAYER, $dto->token);

        /** @var QuizPlayerDomainObject|null $player */
        $player = $this->playerRepository->findFirstWhere([
            QuizPlayerDomainObjectAbstract::ID => $playerId,
            QuizPlayerDomainObjectAbstract::ORGANIZER_ID => $dto->organizer_id,
        ]);

        if ($player === null) {
            throw new InvalidPasswordSetupTokenException(__('This link is invalid or has expired. Please request a new one.'));
        }

        $this->playerRepository->updateFromArray($player->getId(), [
            QuizPlayerDomainObjectAbstract::PASSWORD => $this->hasher->make($dto->password),
        ]);

        return new QuizPlayerSessionDTO(
            username: $player->getUsername(),
            token: $this->sessionService->issueToken($player),
        );
    }
}
