<?php

declare(strict_types=1);

namespace HiEvents\Models;

class ParentalConsent extends BaseModel
{
    protected function getCastMap(): array
    {
        return [
            'requested_at' => 'datetime',
            'expires_at' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }
}
