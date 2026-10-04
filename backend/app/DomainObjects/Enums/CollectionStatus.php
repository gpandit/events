<?php

namespace HiEvents\DomainObjects\Enums;

enum CollectionStatus: string
{
    use BaseEnum;

    case PENDING = 'PENDING';
    case READY = 'READY';
    case COLLECTED = 'COLLECTED';
}
