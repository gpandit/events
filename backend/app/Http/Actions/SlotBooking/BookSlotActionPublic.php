<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\SlotBooking;

use HiEvents\Exceptions\InvalidTicketLookupTokenException;
use HiEvents\Exceptions\SlotAlreadyBookedException;
use HiEvents\Exceptions\SlotBookingNotEnabledException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\SlotBooking\BookSlotRequest;
use HiEvents\Http\ResponseCodes;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Resources\Order\OrderResourcePublic;
use HiEvents\Services\Application\Locale\LocaleService;
use HiEvents\Services\Domain\Customer\CustomerTokenResolver;
use HiEvents\Services\Domain\SlotBooking\BookSlotService;
use HiEvents\Services\Domain\SlotBooking\DTO\BookSlotDTO;
use Illuminate\Http\JsonResponse;
use Throwable;

class BookSlotActionPublic extends BaseAction
{
    public const CUSTOMER_TOKEN_HEADER = 'X-Customer-Token';

    public function __construct(
        private readonly BookSlotService $bookSlotService,
        private readonly CustomerTokenResolver $customerTokenResolver,
        private readonly EventRepositoryInterface $eventRepository,
        private readonly LocaleService $localeService,
    ) {}

    /**
     * Book a time slot
     *
     * Requires a logged-in customer (`X-Customer-Token`). A customer holds at most one active
     * slot per event: pass `replace: true` to cancel the existing slot and book this one atomically.
     *
     * @throws Throwable
     */
    public function __invoke(BookSlotRequest $request, int $eventId): JsonResponse
    {
        $event = $this->eventRepository->findById($eventId);

        try {
            $customer = $this->customerTokenResolver->resolve(
                $request->header(self::CUSTOMER_TOKEN_HEADER),
                $event->getOrganizerId(),
            );

            $order = $this->bookSlotService->book(new BookSlotDTO(
                event_id: $eventId,
                event_occurrence_id: $request->validated('event_occurrence_id'),
                first_name: $customer->getFirstName(),
                last_name: $customer->getLastName(),
                email: $customer->getEmail(),
                children: $request->validated('children'),
                replace: (bool) $request->validated('replace', false),
                locale: $this->localeService->getLocaleOrDefault($request->getPreferredLanguage()),
            ));
        } catch (InvalidTicketLookupTokenException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_UNAUTHORIZED);
        } catch (SlotAlreadyBookedException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_CONFLICT);
        } catch (SlotBookingNotEnabledException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_NOT_FOUND);
        }

        return $this->resourceResponse(
            resource: OrderResourcePublic::class,
            data: $order,
            statusCode: ResponseCodes::HTTP_CREATED,
        );
    }
}
