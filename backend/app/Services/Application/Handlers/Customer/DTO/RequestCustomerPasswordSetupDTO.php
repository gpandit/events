<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Customer\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class RequestCustomerPasswordSetupDTO extends BaseDataObject
{
    public function __construct(
        public int $organizer_id,
        public string $email,
    ) {}
}
