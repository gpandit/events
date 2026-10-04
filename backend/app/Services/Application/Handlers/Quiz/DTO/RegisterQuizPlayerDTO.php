<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Quiz\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;
use HiEvents\DomainObjects\Enums\QuizAgeBand;

class RegisterQuizPlayerDTO extends BaseDataObject
{
    public function __construct(
        public int $organizer_id,
        public string $username,
        public string $first_name,
        public string $email,
        public QuizAgeBand $age_band,
        public string $password,
    ) {}
}
