<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\QuizUsernameCharacterDomainObject;
use HiEvents\Models\QuizUsernameCharacter;
use HiEvents\Repository\Interfaces\QuizUsernameCharacterRepositoryInterface;
use Illuminate\Support\Collection;

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

    public function findRandomMany(int $count): Collection
    {
        return $this->runQuery(
            fn () => collect($this->handleResults($this->model->inRandomOrder()->limit($count)->get()))
        );
    }
}
