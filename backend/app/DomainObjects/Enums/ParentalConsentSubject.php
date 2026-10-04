<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects\Enums;

enum ParentalConsentSubject: string
{
    use BaseEnum;

    case CHILD_STORY = 'CHILD_STORY';
    case QUIZ_PLAYER = 'QUIZ_PLAYER';
}
