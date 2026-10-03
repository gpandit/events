<?php

namespace HiEvents\DomainObjects\Enums;

enum PaymentProcessingFeeMode: string
{
    use BaseEnum;

    case HIDE = 'HIDE';
    case SHOW = 'SHOW';
    case COLLECT = 'COLLECT';
}
