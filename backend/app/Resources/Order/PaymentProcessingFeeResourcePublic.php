<?php

namespace HiEvents\Resources\Order;

use HiEvents\Resources\BaseResource;
use HiEvents\Services\Domain\Order\DTO\PaymentProcessingFeeQuoteDTO;
use Illuminate\Http\Request;

/**
 * @mixin PaymentProcessingFeeQuoteDTO
 */
class PaymentProcessingFeeResourcePublic extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            /** @var 'HIDE'|'SHOW'|'COLLECT' */
            'mode' => $this->mode->value,
            'fee' => $this->fee,
            'covered' => $this->covered,
            'total_without_fee' => $this->totalWithoutFee,
            'total_with_fee' => $this->totalWithFee,
            'currency' => $this->currency,
        ];
    }
}
