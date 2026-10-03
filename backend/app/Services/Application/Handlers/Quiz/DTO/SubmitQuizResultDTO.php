<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;
use HiEvents\DomainObjects\QuizPlayerDomainObject;

class SubmitQuizResultDTO extends BaseDataObject
{
    public function __construct(
        public QuizPlayerDomainObject $player,
        public string $age_band,
        public int $score,
        public int $total_questions,
    ) {}
}
