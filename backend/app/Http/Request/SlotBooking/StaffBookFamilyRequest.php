<?php

declare(strict_types=1);

namespace HiEvents\Http\Request\SlotBooking;

use HiEvents\Http\Request\BaseRequest;
use Illuminate\Validation\Rule;

class StaffBookFamilyRequest extends BaseRequest
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
            'parent_first_name' => ['required', 'string', 'max:255'],
            'parent_last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'children' => ['required', 'array', 'min:1', 'max:50'],
            'children.*.first_name' => ['required', 'string', 'max:255'],
            'children.*.last_name' => ['nullable', 'string', 'max:255'],
            'children.*.price_label' => ['nullable', 'string', 'max:255'],
        ];
    }
}
