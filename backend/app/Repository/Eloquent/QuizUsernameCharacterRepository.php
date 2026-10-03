<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\QuizUsernameCharacterDomainObject;
use HiEvents\Models\QuizUsernameCharacter;
use HiEvents\Repository\Interfaces\QuizUsernameCharacterRepositoryInterface;

/**
 * @extends BaseRepository<QuizUsernameCharacterDomainObject>
 */
class QuizUsernameCharacterRepository extends BaseRepository implements QuizUsernameCharacterRepositoryInterface
{
    protected function getModel(): string
    {
        return QuizUsernameCharacter::class;
    }

    public function getDomainObject(): string
    {
        return QuizUsernameCharacterDomainObject::class;
    }

    public function findRandom(): ?QuizUsernameCharacterDomainObject
    {
        return $this->runQuery(
            fn () => $this->handleSingleResult($this->model->inRandomOrder()->first())
        );
    }
}
