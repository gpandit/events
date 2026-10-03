<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\Quiz;

class QuizPointsCalculator
{
    private const POINTS_PER_CORRECT_ANSWER = 10;

    public function calculate(int $score, int $totalQuestions): int
    {
        $percentage = $totalQuestions === 0 ? 0 : $score / $totalQuestions * 100;

        return $score * self::POINTS_PER_CORRECT_ANSWER + $this->bonusFor($percentage);
    }

    private function bonusFor(float $percentage): int
    {
        return match (true) {
            $percentage >= 100 => 50,
            $percentage > 85 => 25,
            $percentage > 60 => 10,
            default => 0,
        };
    }
}
