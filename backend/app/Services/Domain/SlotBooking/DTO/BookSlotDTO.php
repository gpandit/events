<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class BookSlotDTO extends BaseDataObject
{
    /**
     * @param  array<int, array{first_name: string, last_name?: string|null}>  $children
     */
    public function __construct(
        public readonly int $event_id,
        public readonly int $event_occurrence_id,
        public readonly string $first_name,
        public readonly string $last_name,
        public readonly string $email,
        public readonly array $children,
        public readonly bool $replace = false,
        public readonly bool $is_staff = false,
        public readonly string $locale = 'en',
    ) {}
}
