<?php

namespace HiEvents\Http\Request\Shop;

use HiEvents\Http\Request\BaseRequest;

class OrderCollectionRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'order_ids' => ['required', 'array', 'min:1', 'max:200'],
            'order_ids.*' => ['integer'],
        ];
    }
}
