<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\Quiz;

use HiEvents\DomainObjects\Generated\QuizPlayerDomainObjectAbstract;
use HiEvents\DomainObjects\Generated\QuizUsernameCharacterDomainObjectAbstract;
use HiEvents\Exceptions\QuizUsernameTakenException;
use HiEvents\Exceptions\QuizUsernameUnavailableException;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Repository\Interfaces\QuizUsernameCharacterRepositoryInterface;

class QuizUsernameGenerator
{
    public const OPTION_COUNT = 10;

    private const SUFFIX_ATTEMPTS = 5;

    private const MIN_SUFFIX = 10;

    private const MAX_SUFFIX = 999;

    public function __construct(
        private readonly QuizUsernameCharacterRepositoryInterface $characterRepository,
        private readonly QuizPlayerRepositoryInterface $playerRepository,
    ) {}

    /**
     * @return string[]
     *
     * @throws QuizUsernameUnavailableException
     */
    public function generateOptions(int $organizerId): array
    {
        $options = [];

        foreach ($this->characterRepository->findRandomMany(self::OPTION_COUNT) as $character) {
            for ($attempt = 0; $attempt < self::SUFFIX_ATTEMPTS; $attempt++) {
                $username = $character->getName().random_int(self::MIN_SUFFIX, self::MAX_SUFFIX);

                if (! $this->isTaken($organizerId, $username)) {
                    $options[] = $username;
                    break;
                }
            }
        }

        if ($options === []) {
            throw new QuizUsernameUnavailableException(__('Unable to create usernames right now. Please try again.'));
        }

        return $options;
    }

    /**
     * @throws QuizUsernameTakenException
     */
    public function assertChoosable(int $organizerId, string $username): void
    {
        if (! preg_match('/^(.+?)(\d{2,3})$/', $username, $matches)) {
            throw new QuizUsernameTakenException(__('That username is not available. Please choose another.'));
        }

        $character = $this->characterRepository->findFirstWhere([
            QuizUsernameCharacterDomainObjectAbstract::NAME => $matches[1],
        ]);

        if ($character === null || $this->isTaken($organizerId, $username)) {
            throw new QuizUsernameTakenException(__('That username has just been taken. Please choose another.'));
        }
    }

    private function isTaken(int $organizerId, string $username): bool
    {
        return $this->playerRepository->findFirstWhere([
            QuizPlayerDomainObjectAbstract::ORGANIZER_ID => $organizerId,
            fn ($query) => $query->whereRaw('LOWER(username) = ?', [mb_strtolower($username)]),
        ]) !== null;
    }
}
