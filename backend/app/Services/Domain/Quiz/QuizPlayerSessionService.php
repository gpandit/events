<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\Quiz;

use HiEvents\DomainObjects\Generated\QuizPlayerDomainObjectAbstract;
use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Exceptions\InvalidQuizPlayerTokenException;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Support\Carbon;

class QuizPlayerSessionService
{
    private const TOKEN_LIFETIME_DAYS = 90;

    public function __construct(
        private readonly Encrypter $encrypter,
        private readonly QuizPlayerRepositoryInterface $playerRepository,
    ) {}

    public function issueToken(QuizPlayerDomainObject $player): string
    {
        return $this->encrypter->encryptString(json_encode([
            'player_id' => $player->getId(),
            'organizer_id' => $player->getOrganizerId(),
            'expires_at' => Carbon::now()->addDays(self::TOKEN_LIFETIME_DAYS)->getTimestamp(),
        ], JSON_THROW_ON_ERROR));
    }

    /**
     * @throws InvalidQuizPlayerTokenException
     */
    public function authenticate(?string $token, int $organizerId): QuizPlayerDomainObject
    {
        if ($token === null || $token === '') {
            throw new InvalidQuizPlayerTokenException;
        }

        try {
            $payload = json_decode($this->encrypter->decryptString($token), true, flags: JSON_THROW_ON_ERROR);
        } catch (DecryptException|\JsonException) {
            throw new InvalidQuizPlayerTokenException;
        }

        if (($payload['organizer_id'] ?? null) !== $organizerId
            || ($payload['expires_at'] ?? 0) < Carbon::now()->getTimestamp()) {
            throw new InvalidQuizPlayerTokenException;
        }

        $player = $this->playerRepository->findFirstWhere([
            QuizPlayerDomainObjectAbstract::ID => $payload['player_id'] ?? 0,
            QuizPlayerDomainObjectAbstract::ORGANIZER_ID => $organizerId,
        ]);

        return $player ?? throw new InvalidQuizPlayerTokenException;
    }
}
