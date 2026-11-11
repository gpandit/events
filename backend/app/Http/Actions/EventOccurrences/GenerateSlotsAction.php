<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\EventOccurrences;

use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\Exceptions\InvalidSlotConfigurationException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\EventOccurrence\GenerateSlotsRequest;
use HiEvents\Http\ResponseCodes;
use HiEvents\Services\Application\Handlers\EventOccurrence\DTO\GenerateSlotsDTO;
use HiEvents\Services\Application\Handlers\EventOccurrence\GenerateSlotsHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Throwable;

class GenerateSlotsAction extends BaseAction
{
    public function __construct(
        private readonly GenerateSlotsHandler $handler,
    ) {}

    /**
     * Generate time slots
     *
     * Creates one occurrence per slot between `start_time` and `end_time` on `date` (event timezone).
     * Existing slots at the same start time are skipped.
     *
     * @throws Throwable
     */
    public function __invoke(int $eventId, GenerateSlotsRequest $request): JsonResponse
    {
        $this->isActionAuthorized($eventId, EventDomainObject::class);

        try {
            $created = $this->handler->handle(new GenerateSlotsDTO(
                event_id: $eventId,
                account_id: $this->getAuthenticatedAccountId(),
                date: $request->validated('date'),
                start_time: $request->validated('start_time'),
                end_time: $request->validated('end_time'),
                slot_minutes: $request->validated('slot_minutes'),
                children_per_slot: $request->validated('children_per_slot'),
                ticket_event_id: $request->validated('ticket_event_id'),
                grotto_product_id: $request->validated('grotto_product_id'),
                child_product_ids: $request->validated('child_product_ids'),
            ));
        } catch (InvalidSlotConfigurationException $exception) {
            throw ValidationException::withMessages(['slot_minutes' => [$exception->getMessage()]]);
        }

        return $this->jsonResponse(['created' => $created], ResponseCodes::HTTP_CREATED);
    }
}
