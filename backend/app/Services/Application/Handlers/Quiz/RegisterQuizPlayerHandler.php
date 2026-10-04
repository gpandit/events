<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\Generated\QuizPlayerDomainObjectAbstract;
use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\QuizPlayerSessionDTO;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RegisterQuizPlayerDTO;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use HiEvents\Services\Domain\Quiz\QuizUsernameGenerator;
use Illuminate\Contracts\Hashing\Hasher;

class RegisterQuizPlayerHandler
{
    public function __construct(
        private readonly QuizPlayerRepositoryInterface $playerRepository,
        private readonly QuizUsernameGenerator $usernameGenerator,
        private readonly QuizPlayerSessionService $sessionService,
        private readonly Hasher $hasher,
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

        return new QuizPlayerSessionDTO(
            username: $player->getUsername(),
            token: $this->sessionService->issueToken($player),
        );
    }
}
