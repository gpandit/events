<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects\Enums;

enum ChildStorySubmissionType: string
{
    use BaseEnum;

    case STORY = 'STORY';
    case POEM = 'POEM';
}
