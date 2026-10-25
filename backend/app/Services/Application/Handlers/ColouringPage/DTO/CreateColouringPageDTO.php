<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ColouringPage\DTO;

use HiEvents\DomainObjects\Enums\ColouringPageAgeGroup;
use HiEvents\DomainObjects\Enums\ColouringPageTint;
use HiEvents\DomainObjects\Status\ColouringPageStatus;
use Illuminate\Http\UploadedFile;

class CreateColouringPageDTO
{
    public function __construct(
        public readonly int $organizerId,
        public readonly string $title,
        public readonly ColouringPageAgeGroup $ageGroup,
        public readonly ColouringPageTint $tint,
        public readonly ColouringPageStatus $status,
        public readonly UploadedFile $pdf,
        public readonly UploadedFile $thumbnail,
    ) {}
}
