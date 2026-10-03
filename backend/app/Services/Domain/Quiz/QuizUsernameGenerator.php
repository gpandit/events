<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\Quiz;

use HiEvents\DomainObjects\Generated\QuizPlayerDomainObjectAbstract;
use HiEvents\Exceptions\QuizUsernameUnavailableException;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Repository\Interfaces\QuizUsernameCharacterRepositoryInterface;

class QuizUsernameGenerator
{
    private const MAX_ATTEMPTS = 25;

    private const MIN_SUFFIX = 10;

    private const MAX_SUFFIX = 999;

    public function __construct(
        private readonly QuizUsernameCharacterRepositoryInterface $characterRepository,
        private readonly QuizPlayerRepositoryInterface $playerRepository,
    ) {}

    /**
     * @throws QuizUsernameUnavailableException
     */
    public function generate(int $organizerId): string
    {
        for ($attempt = 0; $attempt < self::MAX_ATTEMPTS; $attempt++) {
            $character = $this->characterRepository->findRandom();

            if ($character === null) {
                break;
            }

            $username = $character->getName().random_int(self::MIN_SUFFIX, self::MAX_SUFFIX);

            $taken = $this->playerRepository->findFirstWhere([
                QuizPlayerDomainObjectAbstract::ORGANIZER_ID => $organizerId,
                fn ($query) => $query->whereRaw('LOWER(username) = ?', [mb_strtolower($username)]),
            ]);

            if ($taken === null) {
                return $username;
            }
        }

        throw new QuizUsernameUnavailableException(__('Unable to create a username right now. Please try again.'));
    }
}
