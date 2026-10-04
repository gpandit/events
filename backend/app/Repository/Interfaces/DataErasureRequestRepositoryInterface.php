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
     * @return int[] ids of the orders that were anonymised
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

    public function anonymiseWaitlistEntries(string $email): void;

    public function anonymiseStripeCustomers(string $email): void;

    public function deleteCustomerAccounts(string $email): void;

    public function deleteTicketLookupTokens(string $email): void;

    /**
     * Deletes the stories and puzzle players of children whose parent used this email.
     *
     * @return int number of child records removed
     */
    public function deleteChildRecords(string $email): int;
}
