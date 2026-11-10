<?php

declare(strict_types=1);

namespace HiEvents\Models;

class SlotBookingConfig extends BaseModel
{
    protected function getCastMap(): array
    {
        return [
            'child_product_ids' => 'array',
        ];
    }
}
