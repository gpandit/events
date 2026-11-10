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
    ) {}
}
