<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\Generated\QuizResultDomainObjectAbstract;
use HiEvents\Repository\DTO\Quiz\QuizPlayerTotalsDTO;
use HiEvents\Repository\Interfaces\QuizResultRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\QuizResultOutcomeDTO;
use HiEvents\Services\Application\Handlers\Quiz\DTO\SubmitQuizResultDTO;
use HiEvents\Services\Domain\Quiz\QuizPointsCalculator;
use Illuminate\Support\Carbon;

class SubmitQuizResultHandler
{
    public function __construct(
        private readonly QuizResultRepositoryInterface $resultRepository,
        private readonly QuizPointsCalculator $pointsCalculator,
    ) {}

    public function handle(SubmitQuizResultDTO $dto): QuizResultOutcomeDTO
    {
        $points = $this->pointsCalculator->calculate($dto->score, $dto->total_questions);

        $this->resultRepository->create([
            QuizResultDomainObjectAbstract::ORGANIZER_ID => $dto->player->getOrganizerId(),
            QuizResultDomainObjectAbstract::QUIZ_PLAYER_ID => $dto->player->getId(),
            QuizResultDomainObjectAbstract::AGE_BAND => $dto->age_band,
            QuizResultDomainObjectAbstract::SCORE => $dto->score,
            QuizResultDomainObjectAbstract::TOTAL_QUESTIONS => $dto->total_questions,
            QuizResultDomainObjectAbstract::PERCENTAGE => (int) round($dto->score / $dto->total_questions * 100),
            QuizResultDomainObjectAbstract::POINTS => $points,
            QuizResultDomainObjectAbstract::TAKEN_AT => Carbon::now(),
        ]);

        $bandTotal = $this->resultRepository
            ->getPlayerTotals($dto->player->getId())
            ->first(fn (QuizPlayerTotalsDTO $totals) => $totals->age_band === $dto->age_band);

        return new QuizResultOutcomeDTO(
            points_awarded: $points,
            total_points: $bandTotal?->total_points ?? $points,
        );
    }
}
