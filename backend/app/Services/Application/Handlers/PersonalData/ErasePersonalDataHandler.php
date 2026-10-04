<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\PersonalData;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\DomainObjects\DataErasureRequestDomainObject;
use HiEvents\Exceptions\InvalidCredentialsException;
use HiEvents\Exceptions\InvalidTicketLookupTokenException;
use HiEvents\Repository\Interfaces\CustomerRepositoryInterface;
use HiEvents\Services\Domain\PersonalData\PersonalDataErasureService;
use HiEvents\Services\Domain\TicketLookup\TicketLookupTokenService;
use Illuminate\Contracts\Hashing\Hasher;

class ErasePersonalDataHandler
{
    public function __construct(
        private readonly TicketLookupTokenService $ticketLookupTokenService,
        private readonly CustomerRepositoryInterface $customerRepository,
        private readonly PersonalDataErasureService $erasureService,
        private readonly Hasher $hasher,
    ) {}

    /**
     * @throws InvalidTicketLookupTokenException
     * @throws InvalidCredentialsException
     */
    public function handle(string $token, ?string $password): DataErasureRequestDomainObject
    {
        $email = mb_strtolower(trim($this->ticketLookupTokenService->findValid($token)->getEmail()));

        $this->assertPasswordMatchesWhenAccountHasOne($email, $password);

        return $this->erasureService->erase($email);
    }

    /**
     * @throws InvalidCredentialsException
     */
    private function assertPasswordMatchesWhenAccountHasOne(string $email, ?string $password): void
    {
        $passwordHashes = $this->customerRepository
            ->findWhere([fn ($query) => $query->whereRaw('LOWER(email) = ?', [$email])])
            ->map(fn (CustomerDomainObject $customer) => $customer->getPassword())
            ->filter();

        if ($passwordHashes->isEmpty()) {
            return;
        }

        $matches = $password !== null
            && $passwordHashes->contains(fn (string $hash) => $this->hasher->check($password, $hash));

        if (! $matches) {
            throw new InvalidCredentialsException(__('Password is incorrect'));
        }
    }
}
