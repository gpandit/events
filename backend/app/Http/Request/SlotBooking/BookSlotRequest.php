<?php

declare(strict_types=1);

namespace HiEvents\Http\Request\SlotBooking;

use HiEvents\Http\Request\BaseRequest;
use Illuminate\Validation\Rule;

class BookSlotRequest extends BaseRequest
{
    public function rules(): array
    {
        $eventId = (int) $this->route('event_id');

        return [
            'event_occurrence_id' => [
                'required',
                'integer',
                Rule::exists('event_occurrences', 'id')
                    ->where('event_id', $eventId)
                    ->whereNull('deleted_at'),
            ],
            'children' => ['required', 'array', 'min:1', 'max:50'],
            'children.*.first_name' => ['required', 'string', 'max:255'],
            'children.*.last_name' => ['nullable', 'string', 'max:255'],
            'replace' => ['nullable', 'boolean'],
        ];
    }
}
