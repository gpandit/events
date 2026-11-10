<?php

declare(strict_types=1);

namespace HiEvents\Http\Request\EventOccurrence;

use HiEvents\Http\Request\BaseRequest;
use HiEvents\Services\Domain\EventOccurrence\SlotWindowCalculator;

class GenerateSlotsRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'slot_minutes' => ['required', 'integer', 'min:'.SlotWindowCalculator::MIN_SLOT_MINUTES, 'max:'.SlotWindowCalculator::MAX_SLOT_MINUTES],
            'children_per_slot' => ['required', 'integer', 'min:1', 'max:50'],
            'ticket_event_id' => ['nullable', 'integer', 'exists:events,id'],
            'grotto_product_id' => ['required_with:ticket_event_id', 'nullable', 'integer', 'exists:products,id'],
            'child_product_ids' => ['required_with:ticket_event_id', 'nullable', 'array', 'min:1', 'max:20'],
            'child_product_ids.*' => ['integer', 'exists:products,id'],
        ];
    }
}
