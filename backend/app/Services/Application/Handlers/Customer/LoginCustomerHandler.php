<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Customer;

use HiEvents\Exceptions\InvalidCredentialsException;
use HiEvents\Services\Application\Handlers\Customer\DTO\CustomerSessionDTO;
use HiEvents\Services\Application\Handlers\Customer\DTO\LoginCustomerDTO;
use HiEvents\Services\Domain\Customer\CustomerService;
use HiEvents\Services\Domain\TicketLookup\TicketLookupTokenService;
use Illuminate\Contracts\Hashing\Hasher;

class LoginCustomerHandler
{
    public function __construct(
        private readonly CustomerService $customerService,
        private readonly TicketLookupTokenService $ticketLookupTokenService,
        private readonly Hasher $hasher,
    ) {}

    /**
     * @throws InvalidCredentialsException
     */
    public function handle(LoginCustomerDTO $dto): CustomerSessionDTO
    {
        $customer = $this->customerService->findByEmail($dto->organizer_id, $dto->email);

        if ($customer === null
            || $customer->getPassword() === null
            || ! $this->hasher->check($dto->password, $customer->getPassword())) {
            throw new InvalidCredentialsException(__('Email or password is incorrect'));
        }

        return new CustomerSessionDTO(
            lookup_token: $this->ticketLookupTokenService->issue($customer->getEmail()),
            first_name: $customer->getFirstName(),
        );
    }
}
