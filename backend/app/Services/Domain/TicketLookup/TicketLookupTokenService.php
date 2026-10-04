<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\TicketLookup;

use Carbon\Carbon;
use HiEvents\DomainObjects\TicketLookupTokenDomainObject;
use HiEvents\Exceptions\InvalidTicketLookupTokenException;
use HiEvents\Repository\Interfaces\TicketLookupTokenRepositoryInterface;
use HiEvents\Services\Infrastructure\TokenGenerator\TokenGeneratorService;

class TicketLookupTokenService
{
    private const TOKEN_EXPIRY_HOURS = 24;

    public function __construct(
        private readonly TicketLookupTokenRepositoryInterface $ticketLookupTokenRepository,
        private readonly TokenGeneratorService $tokenGeneratorService,
    ) {}

    public function issue(string $email): string
    {
        $token = $this->tokenGeneratorService->generateToken(prefix: 'tl');

        $this->ticketLookupTokenRepository->deleteWhere(['email' => $email]);
        $this->ticketLookupTokenRepository->create([
            'email' => $email,
            'token' => $token,
            'expires_at' => Carbon::now()->addHours(self::TOKEN_EXPIRY_HOURS)->toDateTimeString(),
        ]);

        return $token;
    }

    /**
     * @throws InvalidTicketLookupTokenException
     */
    public function findValid(string $token): TicketLookupTokenDomainObject
    {
        /** @var TicketLookupTokenDomainObject|null $record */
        $record = $this->ticketLookupTokenRepository->findFirstWhere(['token' => $token]);

        if ($record === null) {
            throw new InvalidTicketLookupTokenException(__('Invalid or expired link. Please request a new one.'));
        }

        if (Carbon::parse($record->getExpiresAt())->isPast()) {
            throw new InvalidTicketLookupTokenException(__('This link has expired. Please request a new one.'));
        }

        return $record;
    }
}
