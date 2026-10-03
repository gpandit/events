<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Customer;

use HiEvents\Services\Application\Handlers\Customer\DTO\RequestCustomerPasswordSetupDTO;
use HiEvents\Services\Domain\Customer\CustomerPasswordSetupMailer;
use HiEvents\Services\Domain\Customer\CustomerService;

class RequestCustomerPasswordSetupHandler
{
    public function __construct(
        private readonly CustomerService $customerService,
        private readonly CustomerPasswordSetupMailer $passwordSetupMailer,
    ) {}

    public function handle(RequestCustomerPasswordSetupDTO $dto): void
    {
        $customer = $this->customerService->findByEmail($dto->organizer_id, $dto->email);

        if ($customer === null) {
            return;
        }

        $this->passwordSetupMailer->send($customer);
    }
}
