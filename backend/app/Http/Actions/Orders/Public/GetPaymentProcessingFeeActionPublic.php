<?php

namespace HiEvents\Http\Actions\Orders\Public;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\Order\PaymentProcessingFeeResourcePublic;
use HiEvents\Services\Application\Handlers\Order\GetPaymentProcessingFeeHandler;
use Illuminate\Http\JsonResponse;

class GetPaymentProcessingFeeActionPublic extends BaseAction
{
    public function __construct(
        private readonly GetPaymentProcessingFeeHandler $handler,
    ) {}

    public function __invoke(int $eventId, string $orderShortId): JsonResponse
    {
        return $this->resourceResponse(
            resource: PaymentProcessingFeeResourcePublic::class,
            data: $this->handler->handle($orderShortId),
        );
    }
}
