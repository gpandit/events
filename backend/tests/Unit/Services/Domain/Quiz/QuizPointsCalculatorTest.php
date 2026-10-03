<?php

namespace Tests\Unit\Services\Domain\Quiz;

use HiEvents\Services\Domain\Quiz\QuizPointsCalculator;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class QuizPointsCalculatorTest extends TestCase
{
    #[DataProvider('scores')]
    public function test_it_awards_points_per_correct_answer_plus_a_bonus_for_high_scores(int $score, int $total, int $expected): void
    {
        $this->assertSame($expected, (new QuizPointsCalculator)->calculate($score, $total));
    }

    public static function scores(): array
    {
        return [
            'nothing correct' => [0, 20, 0],
            'below the pass mark' => [12, 20, 120],
            'just above 60 percent' => [13, 20, 140],
            'above 85 percent' => [18, 20, 205],
            'perfect score' => [20, 20, 250],
            'no questions' => [0, 0, 0],
        ];
    }
}
