<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\PersonalData\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class PersonalDataErasureReportDTO extends BaseDataObject
{
    /**
     * @param  string[]  $order_references  public references of the orders whose personal details were removed
     */
    public function __construct(
        public array $order_references,
        public int $attendees_count,
        public int $customer_accounts_count,
        public int $waitlist_entries_count,
        public int $payment_customer_records_count,
        public int $stories_count,
        public int $puzzle_accounts_count,
        public string $erased_at,
    ) {}
}
