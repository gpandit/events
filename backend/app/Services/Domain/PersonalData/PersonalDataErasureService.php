<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\PersonalData;

use HiEvents\DomainObjects\Generated\DataErasureRequestDomainObjectAbstract;
use HiEvents\Repository\Interfaces\DataErasureRequestRepositoryInterface;
use HiEvents\Services\Domain\PersonalData\DTO\PersonalDataErasureReportDTO;
use Illuminate\Database\DatabaseManager;
use Illuminate\Support\Carbon;

class PersonalDataErasureService
{
    public function __construct(
        private readonly DataErasureRequestRepositoryInterface $repository,
        private readonly DatabaseManager $db,
    ) {}

    public function erase(string $email): PersonalDataErasureReportDTO
    {
        $email = mb_strtolower(trim($email));

        return $this->db->transaction(function () use ($email): PersonalDataErasureReportDTO {
            $orderReferences = $this->repository->anonymiseOrders($email);
            $orderIds = array_keys($orderReferences);
            $attendeesCount = $this->repository->anonymiseAttendees($email, $orderIds);
            $this->repository->scrubOrderRelatedRecords($orderIds);
            $waitlistEntriesCount = $this->repository->anonymiseWaitlistEntries($email);
            $paymentCustomerRecordsCount = $this->repository->anonymiseStripeCustomers($email);
            $customerAccountsCount = $this->repository->deleteCustomerAccounts($email);
            $this->repository->deleteTicketLookupTokens($email);
            $childRecords = $this->repository->deleteChildRecords($email);
            $erasedAt = Carbon::now();

            $this->repository->create([
                DataErasureRequestDomainObjectAbstract::EMAIL_HASH => $this->fingerprint($email),
                DataErasureRequestDomainObjectAbstract::ORDER_IDS => json_encode($orderIds),
                DataErasureRequestDomainObjectAbstract::ORDERS_COUNT => count($orderIds),
                DataErasureRequestDomainObjectAbstract::ATTENDEES_COUNT => $attendeesCount,
                DataErasureRequestDomainObjectAbstract::CHILD_RECORDS_COUNT => $childRecords['stories'] + $childRecords['puzzle_accounts'],
                DataErasureRequestDomainObjectAbstract::ERASED_AT => $erasedAt,
            ]);

            return new PersonalDataErasureReportDTO(
                order_references: array_values($orderReferences),
                attendees_count: $attendeesCount,
                customer_accounts_count: $customerAccountsCount,
                waitlist_entries_count: $waitlistEntriesCount,
                payment_customer_records_count: $paymentCustomerRecordsCount,
                stories_count: $childRecords['stories'],
                puzzle_accounts_count: $childRecords['puzzle_accounts'],
                erased_at: $erasedAt->toDateTimeString(),
            );
        });
    }

    public function fingerprint(string $email): string
    {
        return hash_hmac('sha256', mb_strtolower(trim($email)), (string) config('app.key'));
    }
}
