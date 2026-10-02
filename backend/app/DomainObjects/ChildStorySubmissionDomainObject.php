<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects;

class ChildStorySubmissionDomainObject extends Generated\ChildStorySubmissionDomainObjectAbstract
{
    public function getLastInitial(): string
    {
        return mb_strtoupper(mb_substr($this->getLastName(), 0, 1));
    }
}
