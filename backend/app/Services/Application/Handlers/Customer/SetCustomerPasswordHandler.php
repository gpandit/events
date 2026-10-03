<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Customer;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\DomainObjects\Enums\PasswordSetupSubject;
use HiEvents\DomainObjects\Generated\CustomerDomainObjectAbstract;
use HiEvents\Exceptions\InvalidPasswordSetupTokenException;
use HiEvents\Repository\Interfaces\CustomerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Customer\DTO\CustomerSessionDTO;
use HiEvents\Services\Application\Handlers\Customer\DTO\SetCustomerPasswordDTO;
use HiEvents\Services\Domain\PasswordSetup\PasswordSetupTokenService;
use HiEvents\Services\Domain\TicketLookup\TicketLookupTokenService;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Support\Carbon;

class SetCustomerPasswordHandler
{
    public function __construct(
        private readonly PasswordSetupTokenService $tokenService,
        private readonly CustomerRepositoryInterface $customerRepository,
        private readonly TicketLookupTokenService $ticketLookupTokenService,
        private readonly Hasher $hasher,
    ) {}

    /**
     * @throws InvalidPasswordSetupTokenException
     */
    public function handle(SetCustomerPasswordDTO $dto): CustomerSessionDTO
    {
        $customerId = $this->tokenService->consume(PasswordSetupSubject::CUSTOMER, $dto->token);

        /** @var CustomerDomainObject|null $customer */
        $customer = $this->customerRepository->findFirstWhere([
            CustomerDomainObjectAbstract::ID => $customerId,
            CustomerDomainObjectAbstract::ORGANIZER_ID => $dto->organizer_id,
        ]);

        if ($customer === null) {
            throw new InvalidPasswordSetupTokenException(__('This link is invalid or has expired. Please request a new one.'));
        }

        $this->customerRepository->updateFromArray($customer->getId(), [
            CustomerDomainObjectAbstract::PASSWORD => $this->hasher->make($dto->password),
            CustomerDomainObjectAbstract::EMAIL_VERIFIED_AT => Carbon::now()->toDateTimeString(),
        ]);

        return new CustomerSessionDTO(
            lookup_token: $this->ticketLookupTokenService->issue($customer->getEmail()),
            first_name: $customer->getFirstName(),
        );
    }
}
