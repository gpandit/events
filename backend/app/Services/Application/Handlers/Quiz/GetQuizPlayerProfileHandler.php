<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\Generated\QuizResultDomainObjectAbstract;
use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Repository\Eloquent\Value\OrderAndDirection;
use HiEvents\Repository\Interfaces\QuizResultRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\QuizPlayerProfileDTO;

class GetQuizPlayerProfileHandler
{
    private const RECENT_RESULTS_LIMIT = 50;

    public function __construct(
        private readonly QuizResultRepositoryInterface $resultRepository,
    ) {}

    public function handle(QuizPlayerDomainObject $player): QuizPlayerProfileDTO
    {
        return new QuizPlayerProfileDTO(
            username: $player->getUsername(),
            totals: $this->resultRepository->getPlayerTotals($player->getId()),
            results: $this->resultRepository->findWhere(
                where: [QuizResultDomainObjectAbstract::QUIZ_PLAYER_ID => $player->getId()],
                orderAndDirections: [new OrderAndDirection(QuizResultDomainObjectAbstract::TAKEN_AT, 'desc')],
                limit: self::RECENT_RESULTS_LIMIT,
            ),
        );
    }
}
