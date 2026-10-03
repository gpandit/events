<?php

declare(strict_types=1);

namespace HiEvents\Repository\DTO\Quiz;

use HiEvents\DataTransferObjects\BaseDataObject;

class QuizPlayerTotalsDTO extends BaseDataObject
{
    public function __construct(
        public string $age_band,
        public int $total_points,
        public int $tests_taken,
        public int $best_percentage,
    ) {}
}
