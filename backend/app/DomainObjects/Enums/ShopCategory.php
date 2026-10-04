<?php

namespace HiEvents\DomainObjects\Enums;

enum ShopCategory: string
{
    use BaseEnum;

    case UNIFORM = 'UNIFORM';
    case PRELOVED_UNIFORM = 'PRELOVED_UNIFORM';
    case BOOKS_STATIONERY = 'BOOKS_STATIONERY';
    case MEALS = 'MEALS';

    public function label(): string
    {
        return match ($this) {
            self::UNIFORM => __('New uniform'),
            self::PRELOVED_UNIFORM => __('Preloved uniform'),
            self::BOOKS_STATIONERY => __('Textbooks & stationery'),
            self::MEALS => __('School meals'),
        };
    }

    public function allowedVendorTypes(): array
    {
        return match ($this) {
            self::UNIFORM => [ShopVendorType::SCHOOL, ShopVendorType::EXTERNAL],
            self::PRELOVED_UNIFORM => [ShopVendorType::SCHOOL, ShopVendorType::PTA],
            self::BOOKS_STATIONERY => [ShopVendorType::SCHOOL, ShopVendorType::EXTERNAL],
            self::MEALS => [ShopVendorType::EXTERNAL],
        };
    }

    public function defaultProductCategoryNames(): array
    {
        return match ($this) {
            self::UNIFORM => [
                __('Regular uniform'),
                __('Sports uniform - home'),
                __('Sports uniform - away'),
                __('House uniform'),
            ],
            self::PRELOVED_UNIFORM => [
                __('Regular uniform'),
                __('Sports uniform'),
                __('House uniform'),
            ],
            self::BOOKS_STATIONERY => [
                __('Textbooks'),
                __('Stationery'),
            ],
            self::MEALS => [
                __('Meals'),
            ],
        };
    }
}
