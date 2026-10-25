<?php

declare(strict_types=1);

namespace HiEvents\Services\Infrastructure\ColouringPage\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class ColouringPageFilesDTO extends BaseDataObject
{
    public function __construct(
        public string $pdf_path,
        public string $thumbnail_path,
    ) {}
}
