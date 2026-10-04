<?php

namespace HiEvents\Services\Domain\Shop\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class ShopPickListRowDTO extends BaseDataObject
{
    /**
     * @param  array<int, array{title: string, answer: string}>  $answers
     * @param  array<int, array{name: string, quantity: int}>  $items
     */
    public function __construct(
        public readonly int $order_id,
        public readonly string $order_public_id,
        public readonly string $student_name,
        public readonly array $answers,
        public readonly string $buyer_name,
        public readonly string $buyer_email,
        public readonly string $collection_status,
        public readonly array $items,
    ) {}
}
