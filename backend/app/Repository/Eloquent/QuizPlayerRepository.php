<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Models\QuizPlayer;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;

/**
 * @extends BaseRepository<QuizPlayerDomainObject>
 */
class QuizPlayerRepository extends BaseRepository implements QuizPlayerRepositoryInterface
{
    protected function getModel(): string
    {
        return QuizPlayer::class;
    }

    public function getDomainObject(): string
    {
        return QuizPlayerDomainObject::class;
    }
}
