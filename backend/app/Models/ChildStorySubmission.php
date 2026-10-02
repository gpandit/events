<?php

declare(strict_types=1);

namespace HiEvents\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChildStorySubmission extends BaseModel
{
    protected function getCastMap(): array
    {
        return [
            'consent_own_work' => 'boolean',
            'consent_publish' => 'boolean',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }
}
