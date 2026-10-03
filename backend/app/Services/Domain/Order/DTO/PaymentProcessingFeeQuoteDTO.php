<?php

namespace HiEvents\Services\Domain\Order\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;
use HiEvents\DomainObjects\Enums\PaymentProcessingFeeMode;

class PaymentProcessingFeeQuoteDTO extends BaseDataObject
{
    public function __construct(
        public readonly PaymentProcessingFeeMode $mode,
        public readonly float $fee,
        public readonly bool $covered,
        public readonly float $totalWithoutFee,
        public readonly float $totalWithFee,
        public readonly string $currency,
    ) {}
}
