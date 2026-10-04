<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects\Enums;

enum QuizAgeBand: string
{
    use BaseEnum;

    case AGES_5_TO_7 = '5-7';
    case AGES_8_TO_10 = '8-10';
    case AGES_11_TO_13 = '11-13';
    case AGES_14_TO_17 = '14-17';

    public function requiresParentalConsent(): bool
    {
        return $this !== self::AGES_14_TO_17;
    }
}
