<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ColouringPage\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;
use HiEvents\DomainObjects\Enums\ColouringPageAgeGroup;
use HiEvents\DomainObjects\Enums\ColouringPageTint;
use HiEvents\DomainObjects\Status\ColouringPageStatus;

class UpdateColouringPageDTO extends BaseDataObject
{
    public function __construct(
        public readonly int $organizerId,
        public readonly int $pageId,
        public readonly string $title,
        public readonly ColouringPageAgeGroup $ageGroup,
        public readonly ColouringPageTint $tint,
        public readonly ColouringPageStatus $status,
    ) {}
}
