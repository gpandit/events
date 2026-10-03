<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\QuizResultDomainObject;
use HiEvents\Models\QuizResult;
use HiEvents\Repository\DTO\Quiz\QuizLeaderboardEntryDTO;
use HiEvents\Repository\DTO\Quiz\QuizPlayerTotalsDTO;
use HiEvents\Repository\Interfaces\QuizResultRepositoryInterface;
use Illuminate\Support\Collection;

/**
 * @extends BaseRepository<QuizResultDomainObject>
 */
class QuizResultRepository extends BaseRepository implements QuizResultRepositoryInterface
{
    protected function getModel(): string
    {
        return QuizResult::class;
    }

    public function getDomainObject(): string
    {
        return QuizResultDomainObject::class;
    }

    public function getLeaderboard(int $organizerId, string $ageBand, int $limit): Collection
    {
        return $this->runQuery(function () use ($organizerId, $ageBand, $limit) {
            $rows = $this->db->table('quiz_results')
                ->join('quiz_players', 'quiz_players.id', '=', 'quiz_results.quiz_player_id')
                ->where('quiz_results.organizer_id', $organizerId)
                ->where('quiz_results.age_band', $ageBand)
                ->groupBy('quiz_players.id', 'quiz_players.username')
                ->orderByDesc('total_points')
                ->orderBy('tests_taken')
                ->orderBy('quiz_players.username')
                ->limit($limit)
                ->selectRaw('quiz_players.username as username')
                ->selectRaw('SUM(quiz_results.points) as total_points')
                ->selectRaw('COUNT(quiz_results.id) as tests_taken')
                ->selectRaw('MAX(quiz_results.percentage) as best_percentage')
                ->get();

            return $rows->map(fn ($row) => new QuizLeaderboardEntryDTO(
                username: $row->username,
                total_points: (int) $row->total_points,
                tests_taken: (int) $row->tests_taken,
                best_percentage: (int) $row->best_percentage,
            ));
        });
    }

    public function getPlayerTotals(int $playerId): Collection
    {
        return $this->runQuery(function () use ($playerId) {
            $rows = $this->db->table('quiz_results')
                ->where('quiz_player_id', $playerId)
                ->groupBy('age_band')
                ->orderBy('age_band')
                ->selectRaw('age_band')
                ->selectRaw('SUM(points) as total_points')
                ->selectRaw('COUNT(id) as tests_taken')
                ->selectRaw('MAX(percentage) as best_percentage')
                ->get();

            return $rows->map(fn ($row) => new QuizPlayerTotalsDTO(
                age_band: $row->age_band,
                total_points: (int) $row->total_points,
                tests_taken: (int) $row->tests_taken,
                best_percentage: (int) $row->best_percentage,
            ));
        });
    }
}
