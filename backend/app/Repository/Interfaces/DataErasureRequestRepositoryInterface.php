<?php

declare(strict_types=1);

namespace HiEvents\Repository\Interfaces;

use HiEvents\DomainObjects\DataErasureRequestDomainObject;

/**
 * @extends RepositoryInterface<DataErasureRequestDomainObject>
 */
interface DataErasureRequestRepositoryInterface extends RepositoryInterface
{
    /**
     * @return array<int, string> public order references keyed by order id
     */
    public function anonymiseOrders(string $email): array;

    /**
     * @param  int[]  $orderIds
     */
    public function anonymiseAttendees(string $email, array $orderIds): int;

    /**
     * @param  int[]  $orderIds
     */
    public function scrubOrderRelatedRecords(array $orderIds): void;

    public function anonymiseWaitlistEntries(string $email): int;

    public function anonymiseStripeCustomers(string $email): int;

    public function deleteCustomerAccounts(string $email): int;

    public function deleteTicketLookupTokens(string $email): void;

    /**
     * Deletes the stories and puzzle players of children whose parent used this email.
     *
     * @return array{stories: int, puzzle_accounts: int}
     */
    public function deleteChildRecords(string $email): array;
}
