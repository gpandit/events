<?php

namespace Tests\Unit\Http\Request\Shop;

use HiEvents\Http\Request\Shop\CreateShopRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class CreateShopRequestTest extends TestCase
{
    public function test_valid_shop_is_accepted(): void
    {
        $this->assertFalse($this->validate([
            'organizer_id' => 1,
            'title' => 'Uniform Co',
            'shop_category' => 'UNIFORM',
            'vendor_type' => 'EXTERNAL',
        ])->fails());
    }

    public function test_preloved_uniform_can_be_sold_by_school_or_pta_only(): void
    {
        $base = ['organizer_id' => 1, 'title' => 'Preloved', 'shop_category' => 'PRELOVED_UNIFORM'];

        $this->assertFalse($this->validate($base + ['vendor_type' => 'PTA'])->fails());
        $this->assertFalse($this->validate($base + ['vendor_type' => 'SCHOOL'])->fails());
        $this->assertTrue($this->validate($base + ['vendor_type' => 'EXTERNAL'])->errors()->has('vendor_type'));
    }

    public function test_meals_must_be_an_external_vendor(): void
    {
        $this->assertTrue($this->validate([
            'organizer_id' => 1,
            'title' => 'Canteen',
            'shop_category' => 'MEALS',
            'vendor_type' => 'PTA',
        ])->errors()->has('vendor_type'));
    }

    public function test_unknown_category_is_rejected(): void
    {
        $this->assertTrue($this->validate([
            'organizer_id' => 1,
            'title' => 'Shop',
            'shop_category' => 'TOYS',
            'vendor_type' => 'SCHOOL',
        ])->errors()->has('shop_category'));
    }

    private function validate(array $data): \Illuminate\Validation\Validator
    {
        $request = new CreateShopRequest;
        $request->merge($data);

        return Validator::make($request->all(), $request->rules());
    }
}
