<?php

declare(strict_types=1);

namespace HiEvents\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ColouringPage extends BaseModel
{
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }
}
