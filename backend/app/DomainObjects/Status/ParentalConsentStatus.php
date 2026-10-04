<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects\Status;

use HiEvents\DomainObjects\Enums\BaseEnum;

enum ParentalConsentStatus: string
{
    use BaseEnum;

    case PENDING = 'PENDING';
    case GRANTED = 'GRANTED';
    case DECLINED = 'DECLINED';
}
