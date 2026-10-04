<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ParentalConsent\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class ParentalConsentDetailsDTO extends BaseDataObject
{
    public function __construct(
        public string $subject_type,
        public string $status,
        public bool $is_expired,
        public string $organizer_name,
        public string $child_first_name,
        public ?string $work_type = null,
        public ?string $child_last_initial = null,
        public ?string $year_group = null,
        public ?string $content = null,
        public ?string $submitted_at = null,
        public ?string $username = null,
        public ?string $age_band = null,
    ) {}
}
