<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects\Enums;

enum PasswordSetupSubject: string
{
    use BaseEnum;

    case QUIZ_PLAYER = 'QUIZ_PLAYER';
    case CUSTOMER = 'CUSTOMER';
}
