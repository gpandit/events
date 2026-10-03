<?php

declare(strict_types=1);

namespace HiEvents\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizResult extends BaseModel
{
    protected function getCastMap(): array
    {
        return [
            'score' => 'integer',
            'total_questions' => 'integer',
            'percentage' => 'integer',
            'points' => 'integer',
            'taken_at' => 'datetime',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(QuizPlayer::class, 'quiz_player_id');
    }
}
