<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\SlotBooking;

use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\Exceptions\SlotBookingMisconfiguredException;
use HiEvents\Exceptions\SlotBookingNotEnabledException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\SlotBooking\StaffBookFamilyRequest;
use HiEvents\Http\ResponseCodes;
use HiEvents\Resources\Order\OrderResource;
use HiEvents\Services\Domain\SlotBooking\BookSlotService;
use HiEvents\Services\Domain\SlotBooking\DTO\BookSlotDTO;
use Illuminate\Http\JsonResponse;
use Throwable;

class StaffBookFamilyAction extends BaseAction
{
    public function __construct(
        private readonly BookSlotService $bookSlotService,
    ) {}

    /**
     * Book a family into a slot (staff)
     *
     * Staff bookings skip the one-slot-per-customer rule. When no `email` is given the ticket
     * email goes to the authenticated staff member, who can open or print the QR code.
     *
     * @throws Throwable
     */
    public function __invoke(StaffBookFamilyRequest $request, int $eventId): JsonResponse
    {
        $this->isActionAuthorized($eventId, EventDomainObject::class);

        try {
            $order = $this->bookSlotService->book(new BookSlotDTO(
                event_id: $eventId,
                event_occurrence_id: $request->validated('event_occurrence_id'),
                first_name: $request->validated('parent_first_name'),
                last_name: $request->validated('parent_last_name'),
                email: $request->validated('email') ?? $this->getAuthenticatedUser()->getEmail(),
                children: $request->validated('children'),
                is_staff: true,
            ));
        } catch (SlotBookingMisconfiguredException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_UNPROCESSABLE_ENTITY);
        } catch (SlotBookingNotEnabledException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_NOT_FOUND);
        }

        return $this->resourceResponse(
            resource: OrderResource::class,
            data: $order,
            statusCode: ResponseCodes::HTTP_CREATED,
        );
    }
}
