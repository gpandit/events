<?php

declare(strict_types=1);

namespace HiEvents\Repository\Interfaces;

use HiEvents\DomainObjects\QuizUsernameCharacterDomainObject;

/**
 * @extends RepositoryInterface<QuizUsernameCharacterDomainObject>
 */
interface QuizUsernameCharacterRepositoryInterface extends RepositoryInterface
{
    public function findRandom(): ?QuizUsernameCharacterDomainObject;
}
