<?php

declare(strict_types=1);

namespace HiEvents\Repository\Interfaces;

use HiEvents\DomainObjects\QuizUsernameCharacterDomainObject;
use Illuminate\Support\Collection;

/**
 * @extends RepositoryInterface<QuizUsernameCharacterDomainObject>
 */
interface QuizUsernameCharacterRepositoryInterface extends RepositoryInterface
{
    /**
     * @return Collection<int, QuizUsernameCharacterDomainObject>
     */
    public function findRandomMany(int $count): Collection;
}
