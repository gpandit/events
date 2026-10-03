<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\TicketLookup;

use Carbon\Carbon;
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
}
