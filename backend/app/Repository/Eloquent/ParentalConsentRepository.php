<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\ParentalConsentDomainObject;
use HiEvents\Models\ParentalConsent;
use HiEvents\Repository\Interfaces\ParentalConsentRepositoryInterface;

/**
 * @extends BaseRepository<ParentalConsentDomainObject>
 */
class ParentalConsentRepository extends BaseRepository implements ParentalConsentRepositoryInterface
{
    protected function getModel(): string
    {
        return ParentalConsent::class;
    }

    public function getDomainObject(): string
    {
        return ParentalConsentDomainObject::class;
    }
}
