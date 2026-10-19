<?php

namespace HiEvents\Http\Request\Shop;

use HiEvents\DomainObjects\Enums\ShopCategory;
use HiEvents\DomainObjects\Enums\ShopVendorType;
use HiEvents\Http\Request\BaseRequest;
use Illuminate\Validation\Rule;

class CreateShopRequest extends BaseRequest
{
    public function rules(): array
    {
        $category = ShopCategory::tryFrom((string) $this->input('shop_category'));
        $allowedVendorTypes = $category
            ? array_map(static fn (ShopVendorType $type) => $type->value, $category->allowedVendorTypes())
            : ShopVendorType::valuesArray();

        return [
            'organizer_id' => ['required', 'integer'],
            'title' => ['required', 'string', 'min:1', 'max:150'],
            'description' => ['nullable', 'string', 'max:50000'],
            'shop_category' => ['required', Rule::in(ShopCategory::valuesArray())],
            'vendor_type' => ['required', Rule::in($allowedVendorTypes)],
        ];
    }
}
