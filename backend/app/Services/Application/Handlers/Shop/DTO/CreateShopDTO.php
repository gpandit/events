<?php

namespace HiEvents\Services\Application\Handlers\Shop\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;
use HiEvents\DomainObjects\Enums\ShopCategory;
use HiEvents\DomainObjects\Enums\ShopVendorType;

class CreateShopDTO extends BaseDataObject
{
    public function __construct(
        public readonly int $organizer_id,
        public readonly int $account_id,
        public readonly int $user_id,
        public readonly string $title,
        public readonly ShopCategory $shop_category,
        public readonly ShopVendorType $vendor_type,
        public readonly ?string $description = null,
    ) {}
}
