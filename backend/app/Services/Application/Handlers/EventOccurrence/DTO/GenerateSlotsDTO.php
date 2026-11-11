<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\EventOccurrence\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class GenerateSlotsDTO extends BaseDataObject
{
    public function __construct(
        public readonly int $event_id,
        public readonly int $account_id,
        public readonly string $date,
        public readonly string $start_time,
        public readonly string $end_time,
        public readonly int $slot_minutes,
        public readonly int $children_per_slot,
        public readonly ?int $ticket_event_id = null,
        public readonly ?int $grotto_product_id = null,
        public readonly ?array $child_product_ids = null,
    ) {}
}
