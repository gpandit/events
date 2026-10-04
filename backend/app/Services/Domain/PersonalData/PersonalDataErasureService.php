<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\PersonalData;

use HiEvents\DomainObjects\DataErasureRequestDomainObject;
use HiEvents\DomainObjects\Generated\DataErasureRequestDomainObjectAbstract;
use HiEvents\Repository\Interfaces\DataErasureRequestRepositoryInterface;
use Illuminate\Database\DatabaseManager;
use Illuminate\Support\Carbon;

class PersonalDataErasureService
{
    public function __construct(
        private readonly DataErasureRequestRepositoryInterface $repository,
        private readonly DatabaseManager $db,
    ) {}

    public function erase(string $email): DataErasureRequestDomainObject
    {
        $email = mb_strtolower(trim($email));

        return $this->db->transaction(function () use ($email): DataErasureRequestDomainObject {
            $orderIds = $this->repository->anonymiseOrders($email);
            $attendeesCount = $this->repository->anonymiseAttendees($email, $orderIds);
            $this->repository->scrubOrderRelatedRecords($orderIds);
            $this->repository->anonymiseWaitlistEntries($email);
            $this->repository->anonymiseStripeCustomers($email);
            $this->repository->deleteCustomerAccounts($email);
            $this->repository->deleteTicketLookupTokens($email);
            $childRecordsCount = $this->repository->deleteChildRecords($email);

            /** @var DataErasureRequestDomainObject $request */
            $request = $this->repository->create([
                DataErasureRequestDomainObjectAbstract::EMAIL_HASH => $this->fingerprint($email),
                DataErasureRequestDomainObjectAbstract::ORDER_IDS => json_encode($orderIds),
                DataErasureRequestDomainObjectAbstract::ORDERS_COUNT => count($orderIds),
                DataErasureRequestDomainObjectAbstract::ATTENDEES_COUNT => $attendeesCount,
                DataErasureRequestDomainObjectAbstract::CHILD_RECORDS_COUNT => $childRecordsCount,
                DataErasureRequestDomainObjectAbstract::ERASED_AT => Carbon::now(),
            ]);

            return $request;
        });
    }

    public function fingerprint(string $email): string
    {
        return hash_hmac('sha256', mb_strtolower(trim($email)), (string) config('app.key'));
    }
}
