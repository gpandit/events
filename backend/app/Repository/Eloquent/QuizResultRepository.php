<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\QuizResultDomainObject;
use HiEvents\Models\QuizResult;
use HiEvents\Repository\Interfaces\QuizResultRepositoryInterface;

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
}
