<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\Customer;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\Exceptions\InvalidTicketLookupTokenException;
use HiEvents\Services\Domain\TicketLookup\TicketLookupTokenService;

class CustomerTokenResolver
{
    public function __construct(
        private readonly TicketLookupTokenService $ticketLookupTokenService,
        private readonly CustomerService $customerService,
    ) {}

    public function emailFromToken(?string $token): ?string
    {
        if ($token === null || $token === '') {
            return null;
        }

        try {
            return $this->ticketLookupTokenService->findValid($token)->getEmail();
        } catch (InvalidTicketLookupTokenException) {
            return null;
        }
    }

    /**
     * @throws InvalidTicketLookupTokenException
     */
    public function resolve(?string $token, int $organizerId): CustomerDomainObject
    {
        if ($token === null || $token === '') {
            throw new InvalidTicketLookupTokenException(__('Please log in to continue'));
        }

        $record = $this->ticketLookupTokenService->findValid($token);

        $customer = $this->customerService->findByEmail($organizerId, $record->getEmail());

        if ($customer === null) {
            throw new InvalidTicketLookupTokenException(__('Please log in to continue'));
        }

        return $customer;
    }
}
