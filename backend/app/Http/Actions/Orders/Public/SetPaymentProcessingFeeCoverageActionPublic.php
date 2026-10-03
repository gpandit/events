<?php

namespace HiEvents\Http\Actions\Orders\Public;

use HiEvents\Exceptions\ResourceConflictException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\Order\PaymentProcessingFeeResourcePublic;
use HiEvents\Services\Application\Handlers\Order\SetPaymentProcessingFeeCoverageHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SetPaymentProcessingFeeCoverageActionPublic extends BaseAction
{
    public function __construct(
        private readonly SetPaymentProcessingFeeCoverageHandler $handler,
    ) {}

    public function __invoke(Request $request, int $eventId, string $orderShortId): JsonResponse
    {
        $validated = $request->validate([
            'cover' => ['required', 'boolean'],
        ]);

        try {
            $quote = $this->handler->handle($orderShortId, (bool) $validated['cover']);
        } catch (ResourceConflictException $exception) {
            throw ValidationException::withMessages(['cover' => $exception->getMessage()]);
        }

        return $this->resourceResponse(
            resource: PaymentProcessingFeeResourcePublic::class,
            data: $quote,
        );
    }
}
