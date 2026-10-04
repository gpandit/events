<?php

declare(strict_types=1);

namespace HiEvents\Models;

class DataErasureRequest extends BaseModel
{
    protected function getCastMap(): array
    {
        return [
            'order_ids' => 'array',
            'erased_at' => 'datetime',
        ];
    }
}
