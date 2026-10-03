<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\Customer;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\DomainObjects\Generated\CustomerDomainObjectAbstract;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\Repository\Interfaces\CustomerRepositoryInterface;

class CustomerService
{
    public function __construct(
        private readonly CustomerRepositoryInterface $customerRepository,
    ) {}

    public function findByEmail(int $organizerId, string $email): ?CustomerDomainObject
    {
        return $this->customerRepository->findFirstWhere([
            CustomerDomainObjectAbstract::ORGANIZER_ID => $organizerId,
            CustomerDomainObjectAbstract::EMAIL => mb_strtolower(trim($email)),
        ]);
    }

    public function findOrCreate(
        int $organizerId,
        string $firstName,
        string $lastName,
        string $email,
        ?string $phone = null,
    ): CustomerDomainObject {
        return $this->findByEmail($organizerId, $email) ?? $this->customerRepository->create([
            CustomerDomainObjectAbstract::ORGANIZER_ID => $organizerId,
            CustomerDomainObjectAbstract::FIRST_NAME => trim($firstName),
            CustomerDomainObjectAbstract::LAST_NAME => trim($lastName),
            CustomerDomainObjectAbstract::EMAIL => mb_strtolower(trim($email)),
            CustomerDomainObjectAbstract::PHONE => $this->normalisePhone($phone),
        ]);
    }

    public function recordPurchase(OrderDomainObject $order, int $organizerId): CustomerDomainObject
    {
        $customer = $this->findOrCreate(
            organizerId: $organizerId,
            firstName: (string) $order->getFirstName(),
            lastName: (string) $order->getLastName(),
            email: (string) $order->getEmail(),
            phone: $order->getPhone(),
        );

        $phone = $this->normalisePhone($order->getPhone());

        if ($phone !== null && $phone !== $customer->getPhone()) {
            return $this->customerRepository->updateFromArray($customer->getId(), [
                CustomerDomainObjectAbstract::PHONE => $phone,
            ]);
        }

        return $customer;
    }

    private function normalisePhone(?string $phone): ?string
    {
        $phone = trim((string) $phone);

        return $phone === '' ? null : $phone;
    }
}
