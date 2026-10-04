<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;
use HiEvents\DomainObjects\QuizResultDomainObject;
use HiEvents\Repository\DTO\Quiz\QuizPlayerTotalsDTO;
use Illuminate\Support\Collection;

class QuizPlayerProfileDTO extends BaseDataObject
{
    /**
     * @param  Collection<int, QuizPlayerTotalsDTO>  $totals
     * @param  Collection<int, QuizResultDomainObject>  $results
     * @param  'NOT_REQUIRED'|'PENDING'|'GRANTED'|'DECLINED'  $leaderboard_status
     */
    public function __construct(
        public string $username,
        public string $leaderboard_status,
        public Collection $totals,
        public Collection $results,
    ) {}
}
