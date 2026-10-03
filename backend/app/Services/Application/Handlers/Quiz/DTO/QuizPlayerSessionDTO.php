<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class QuizPlayerSessionDTO extends BaseDataObject
{
    public function __construct(
        public string $username,
        public string $token,
    ) {}
}
