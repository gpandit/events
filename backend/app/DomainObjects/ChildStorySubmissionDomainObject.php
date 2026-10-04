<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects;

class ChildStorySubmissionDomainObject extends Generated\ChildStorySubmissionDomainObjectAbstract
{
    private ?ParentalConsentDomainObject $parentalConsent = null;

    public function getLastInitial(): string
    {
        return mb_strtoupper(mb_substr($this->getLastName(), 0, 1));
    }

    public function getParentalConsent(): ?ParentalConsentDomainObject
    {
        return $this->parentalConsent;
    }

    public function setParentalConsent(?ParentalConsentDomainObject $parentalConsent): self
    {
        $this->parentalConsent = $parentalConsent;

        return $this;
    }
}
