<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class ResetQuizPlayerPasswordDTO extends BaseDataObject
{
    public function __construct(
        public int $organizer_id,
        public string $token,
        public string $password,
    ) {}
}
