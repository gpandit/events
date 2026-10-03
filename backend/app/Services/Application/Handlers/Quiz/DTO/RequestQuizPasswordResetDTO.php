<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class RequestQuizPasswordResetDTO extends BaseDataObject
{
    public function __construct(
        public int $organizer_id,
        public string $username,
    ) {}
}
