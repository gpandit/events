<?php

namespace HiEvents\DomainObjects\Enums;

enum ShopVendorType: string
{
    use BaseEnum;

    case SCHOOL = 'SCHOOL';
    case EXTERNAL = 'EXTERNAL';
    case PTA = 'PTA';

    public function label(): string
    {
        return match ($this) {
            self::SCHOOL => __('School'),
            self::EXTERNAL => __('External vendor'),
            self::PTA => __('PTA'),
        };
    }
}
