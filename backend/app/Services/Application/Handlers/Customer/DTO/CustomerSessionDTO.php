<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Customer\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class CustomerSessionDTO extends BaseDataObject
{
    public function __construct(
        public string $lookup_token,
        public string $first_name,
    ) {}
}
