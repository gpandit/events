<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\SlotBookingConfigDomainObject;
use HiEvents\Models\SlotBookingConfig;
use HiEvents\Repository\Interfaces\SlotBookingConfigRepositoryInterface;

/**
 * @extends BaseRepository<SlotBookingConfigDomainObject>
 */
class SlotBookingConfigRepository extends BaseRepository implements SlotBookingConfigRepositoryInterface
{
    protected function getModel(): string
    {
        return SlotBookingConfig::class;
    }

    public function getDomainObject(): string
    {
        return SlotBookingConfigDomainObject::class;
    }
}
