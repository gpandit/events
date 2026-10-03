<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\PasswordSetup;

use HiEvents\DomainObjects\Enums\PasswordSetupSubject;
use HiEvents\DomainObjects\Generated\PasswordSetupTokenDomainObjectAbstract;
use HiEvents\Exceptions\InvalidPasswordSetupTokenException;
use HiEvents\Repository\Interfaces\PasswordSetupTokenRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PasswordSetupTokenService
{
    private const TOKEN_LIFETIME_MINUTES = 60;

    public function __construct(
        private readonly PasswordSetupTokenRepositoryInterface $tokenRepository,
    ) {}

    public function issue(PasswordSetupSubject $subject, int $subjectId): string
    {
        $token = Str::random(48);

        $this->tokenRepository->deleteWhere([
            PasswordSetupTokenDomainObjectAbstract::SUBJECT_TYPE => $subject->value,
            PasswordSetupTokenDomainObjectAbstract::SUBJECT_ID => $subjectId,
        ]);

        $this->tokenRepository->create([
            PasswordSetupTokenDomainObjectAbstract::SUBJECT_TYPE => $subject->value,
            PasswordSetupTokenDomainObjectAbstract::SUBJECT_ID => $subjectId,
            PasswordSetupTokenDomainObjectAbstract::TOKEN_HASH => $this->hash($token),
            PasswordSetupTokenDomainObjectAbstract::EXPIRES_AT => Carbon::now()->addMinutes(self::TOKEN_LIFETIME_MINUTES)->toDateTimeString(),
        ]);

        return $token;
    }

    /**
     * @throws InvalidPasswordSetupTokenException
     */
    public function consume(PasswordSetupSubject $subject, string $token): int
    {
        $record = $this->tokenRepository->findFirstWhere([
            PasswordSetupTokenDomainObjectAbstract::SUBJECT_TYPE => $subject->value,
            PasswordSetupTokenDomainObjectAbstract::TOKEN_HASH => $this->hash($token),
        ]);

        if ($record === null || Carbon::parse($record->getExpiresAt())->isPast()) {
            throw new InvalidPasswordSetupTokenException(__('This link is invalid or has expired. Please request a new one.'));
        }

        $this->tokenRepository->deleteById($record->getId());

        return $record->getSubjectId();
    }

    private function hash(string $token): string
    {
        return hash('sha256', $token);
    }
}
