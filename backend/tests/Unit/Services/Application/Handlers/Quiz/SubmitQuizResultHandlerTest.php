<?php

namespace Tests\Unit\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Repository\DTO\Quiz\QuizPlayerTotalsDTO;
use HiEvents\Repository\Interfaces\QuizResultRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\SubmitQuizResultDTO;
use HiEvents\Services\Application\Handlers\Quiz\SubmitQuizResultHandler;
use HiEvents\Services\Domain\Quiz\QuizPointsCalculator;
use Mockery as m;
use Tests\TestCase;

class SubmitQuizResultHandlerTest extends TestCase
{
    public function test_it_stores_the_result_with_points_and_returns_the_age_band_total(): void
    {
        $results = m::mock(QuizResultRepositoryInterface::class);
        $player = (new QuizPlayerDomainObject)->setId(5)->setOrganizerId(10);

        $results->shouldReceive('create')
            ->once()
            ->with(m::on(fn (array $attributes) => $attributes['organizer_id'] === 10
                && $attributes['quiz_player_id'] === 5
                && $attributes['age_band'] === '8-10'
                && $attributes['score'] === 17
                && $attributes['total_questions'] === 20
                && $attributes['percentage'] === 85
                && $attributes['points'] === 180
                && isset($attributes['taken_at'])));

        $results->shouldReceive('getPlayerTotals')->once()->with(5)->andReturn(collect([
            new QuizPlayerTotalsDTO('5-7', 90, 1, 90),
            new QuizPlayerTotalsDTO('8-10', 400, 3, 85),
        ]));

        $outcome = (new SubmitQuizResultHandler($results, new QuizPointsCalculator))->handle(
            new SubmitQuizResultDTO($player, '8-10', 17, 20)
        );

        $this->assertSame(180, $outcome->points_awarded);
        $this->assertSame(400, $outcome->total_points);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
