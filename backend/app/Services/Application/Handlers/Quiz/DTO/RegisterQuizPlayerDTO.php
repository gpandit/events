<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class RegisterQuizPlayerDTO extends BaseDataObject
{
    public function __construct(
        public int $organizer_id,
        public string $first_name,
        public string $last_name,
        public string $email,
        public string $password,
    ) {}
}
