<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects\Enums;

enum ColouringPageTint: string
{
    use BaseEnum;

    case PEACH = 'PEACH';
    case SKY = 'SKY';
    case MINT = 'MINT';
    case LILAC = 'LILAC';
}
