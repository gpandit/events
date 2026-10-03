<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class QuizResultOutcomeDTO extends BaseDataObject
{
    public function __construct(
        public int $points_awarded,
        public int $total_points,
    ) {}
}
