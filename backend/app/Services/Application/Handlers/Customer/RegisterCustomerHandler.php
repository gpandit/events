<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Customer;

use HiEvents\Services\Application\Handlers\Customer\DTO\RegisterCustomerDTO;
use HiEvents\Services\Domain\Customer\CustomerPasswordSetupMailer;
use HiEvents\Services\Domain\Customer\CustomerService;

class RegisterCustomerHandler
{
    public function __construct(
        private readonly CustomerService $customerService,
        private readonly CustomerPasswordSetupMailer $passwordSetupMailer,
    ) {}

    public function handle(RegisterCustomerDTO $dto): void
    {
        $customer = $this->customerService->findOrCreate(
            organizerId: $dto->organizer_id,
            firstName: $dto->first_name,
            lastName: $dto->last_name,
            email: $dto->email,
            phone: $dto->phone,
        );

        $this->passwordSetupMailer->send($customer);
    }
}
