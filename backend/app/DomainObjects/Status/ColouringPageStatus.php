<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects\Status;

use HiEvents\DomainObjects\Enums\BaseEnum;

enum ColouringPageStatus: string
{
    use BaseEnum;

    case DRAFT = 'DRAFT';
    case PUBLISHED = 'PUBLISHED';
}
