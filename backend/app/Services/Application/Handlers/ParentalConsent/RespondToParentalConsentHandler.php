<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ParentalConsent;

use HiEvents\Exceptions\InvalidParentalConsentTokenException;
use HiEvents\Exceptions\ParentalConsentNotRespondableException;
use HiEvents\Services\Domain\ParentalConsent\ParentalConsentService;

class RespondToParentalConsentHandler
{
    public function __construct(
        private readonly ParentalConsentService $parentalConsentService,
    ) {}

    /**
     * @throws InvalidParentalConsentTokenException
     * @throws ParentalConsentNotRespondableException
     */
    public function handle(int $organizerId, string $token, bool $granted): void
    {
        $consent = $this->parentalConsentService->findByToken($organizerId, $token);

        $this->parentalConsentService->respond($consent, $granted);
    }
}
