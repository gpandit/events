<?php

namespace HiEvents\DomainObjects;

use HiEvents\DomainObjects\Status\ParentalConsentStatus;
use Illuminate\Support\Carbon;

class ParentalConsentDomainObject extends Generated\ParentalConsentDomainObjectAbstract
{
    public function isGranted(): bool
    {
        return $this->getStatus() === ParentalConsentStatus::GRANTED->value;
    }

    public function isPending(): bool
    {
        return $this->getStatus() === ParentalConsentStatus::PENDING->value;
    }

    public function isExpired(): bool
    {
        return $this->isPending() && Carbon::parse($this->getExpiresAt())->isPast();
    }
}
