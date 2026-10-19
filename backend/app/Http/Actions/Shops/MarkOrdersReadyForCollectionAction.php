<?php

namespace HiEvents\Http\Actions\Shops;

use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\Exceptions\EventNotAShopException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\Shop\OrderCollectionRequest;
use HiEvents\Services\Application\Handlers\Shop\MarkOrdersReadyForCollectionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class MarkOrdersReadyForCollectionAction extends BaseAction
{
    public function __construct(
        private readonly MarkOrdersReadyForCollectionHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(OrderCollectionRequest $request, int $eventId): JsonResponse
    {
        $this->isActionAuthorized($eventId, EventDomainObject::class);

        try {
            $updated = $this->handler->handle($eventId, $request->validated('order_ids'));
        } catch (EventNotAShopException $e) {
            throw ValidationException::withMessages(['event_id' => $e->getMessage()]);
        }

        return $this->jsonResponse(['updated' => $updated]);
    }
}
