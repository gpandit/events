<?php

namespace HiEvents\Services\Application\Handlers\Contact\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class SubmitSiteContactMessageDTO extends BaseDataObject
{
    public function __construct(
        public string $name,
        public string $email,
        public string $message,
    ) {}
}
