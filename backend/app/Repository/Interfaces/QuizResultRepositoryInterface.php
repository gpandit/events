<?php

declare(strict_types=1);

namespace HiEvents\Repository\Interfaces;

use HiEvents\DomainObjects\QuizResultDomainObject;
use HiEvents\Repository\DTO\Quiz\QuizLeaderboardEntryDTO;
use HiEvents\Repository\DTO\Quiz\QuizPlayerTotalsDTO;
use Illuminate\Support\Collection;

/**
 * @extends RepositoryInterface<QuizResultDomainObject>
 */
interface QuizResultRepositoryInterface extends RepositoryInterface
{
    /**
     * @return Collection<int, QuizLeaderboardEntryDTO>
     */
    public function getLeaderboard(int $organizerId, string $ageBand, int $limit): Collection;

    /**
     * @return Collection<int, QuizPlayerTotalsDTO>
     */
    public function getPlayerTotals(int $playerId): Collection;
}
