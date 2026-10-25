<?php

declare(strict_types=1);

namespace HiEvents\Http\Request\ColouringPage;

use HiEvents\Http\Request\BaseRequest;
use Illuminate\Validation\Validator;

class ReorderColouringPagesRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'page_ids' => ['required', 'array', 'min:1', 'max:200'],
            'page_ids.*' => ['required', 'integer'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $pageIds = $this->input('page_ids');

            if (is_array($pageIds) && count($pageIds) !== count(array_unique($pageIds))) {
                $validator->errors()->add('page_ids', __('Each colouring page can only appear once.'));
            }
        });
    }
}
