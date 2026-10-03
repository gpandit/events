<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz;

use HiEvents\Repository\DTO\Quiz\QuizLeaderboardEntryDTO;
use HiEvents\Repository\Interfaces\QuizResultRepositoryInterface;
use Illuminate\Support\Collection;

class GetQuizLeaderboardHandler
{
    private const LEADERBOARD_SIZE = 20;

    public function __construct(
        private readonly QuizResultRepositoryInterface $resultRepository,
    ) {}

    /**
     * @return Collection<int, array{rank: int, username: string, total_points: int, tests_taken: int, best_percentage: int}>
     */
    public function handle(int $organizerId, string $ageBand): Collection
    {
        $rank = 0;
        $previousPoints = null;

        return $this->resultRepository
            ->getLeaderboard($organizerId, $ageBand, self::LEADERBOARD_SIZE)
            ->values()
            ->map(function (QuizLeaderboardEntryDTO $entry, int $index) use (&$rank, &$previousPoints) {
                if ($entry->total_points !== $previousPoints) {
                    $rank = $index + 1;
                    $previousPoints = $entry->total_points;
                }

                return [
                    'rank' => $rank,
                    'username' => $entry->username,
                    'total_points' => $entry->total_points,
                    'tests_taken' => $entry->tests_taken,
                    'best_percentage' => $entry->best_percentage,
                ];
            });
    }
}
