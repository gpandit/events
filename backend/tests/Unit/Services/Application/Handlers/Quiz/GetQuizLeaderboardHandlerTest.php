<?php

namespace Tests\Unit\Services\Application\Handlers\Quiz;

use HiEvents\Repository\DTO\Quiz\QuizLeaderboardEntryDTO;
use HiEvents\Repository\Interfaces\QuizResultRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\GetQuizLeaderboardHandler;
use Mockery as m;
use Tests\TestCase;

class GetQuizLeaderboardHandlerTest extends TestCase
{
    public function test_it_ranks_players_and_gives_ties_the_same_rank(): void
    {
        $results = m::mock(QuizResultRepositoryInterface::class);
        $results->shouldReceive('getLeaderboard')->once()->with(10, '8-10', 20)->andReturn(collect([
            new QuizLeaderboardEntryDTO('Simba42', 500, 4, 95),
            new QuizLeaderboardEntryDTO('Nemo17', 400, 3, 90),
            new QuizLeaderboardEntryDTO('Dory88', 400, 5, 85),
            new QuizLeaderboardEntryDTO('Woody101', 120, 1, 60),
        ]));

        $leaderboard = (new GetQuizLeaderboardHandler($results))->handle(10, '8-10');

        $this->assertSame([1, 2, 2, 4], $leaderboard->pluck('rank')->all());
        $this->assertSame('Simba42', $leaderboard->first()['username']);
        $this->assertSame(['rank', 'username', 'total_points', 'tests_taken', 'best_percentage'], array_keys($leaderboard->first()));
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
