<?php

namespace HiEvents;

use HiEvents\DomainObjects\Enums\BaseEnum;

enum Locale: string
{
    use BaseEnum;

    case EN = 'en';
    case AR = 'ar';

    public static function getSupportedLocales(): array
    {
        return self::valuesArray();
    }
}
