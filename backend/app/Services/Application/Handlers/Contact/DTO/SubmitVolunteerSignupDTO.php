<?php

namespace HiEvents\Services\Application\Handlers\Contact\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class SubmitVolunteerSignupDTO extends BaseDataObject
{
    public function __construct(
        public string $firstName,
        public string $lastName,
        public string $email,
        public string $phone,
        public ?string $message = null,
    ) {}
}
