<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects\Enums;

enum ColouringPageAgeGroup: string
{
    use BaseEnum;

    case AGE_2_5 = 'AGE_2_5';
    case AGE_6_10 = 'AGE_6_10';
    case AGE_11_13 = 'AGE_11_13';
    case AGE_14_18 = 'AGE_14_18';
}
