<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\SlotBooking;

use HiEvents\Exceptions\GrottoNotPurchasedException;
use HiEvents\Exceptions\InvalidTicketLookupTokenException;
use HiEvents\Exceptions\ResourceConflictException;
use HiEvents\Exceptions\SlotAlreadyBookedException;
use HiEvents\Exceptions\SlotBookingNotEnabledException;
use HiEvents\Exceptions\SlotsStillAvailableException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\ResponseCodes;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Resources\Waitlist\WaitlistEntryResource;
use HiEvents\Services\Application\Locale\LocaleService;
use HiEvents\Services\Domain\Customer\CustomerTokenResolver;
use HiEvents\Services\Domain\SlotBooking\SlotWaitlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JoinSlotWaitlistActionPublic extends BaseAction
{
    public function __construct(
        private readonly SlotWaitlistService $slotWaitlistService,
        private readonly CustomerTokenResolver $customerTokenResolver,
        private readonly EventRepositoryInterface $eventRepository,
        private readonly LocaleService $localeService,
    ) {}

    /**
     * Join the slot waitlist
     *
     * Requires a logged-in customer (`X-Customer-Token`). Only open while every future slot is full.
     */
    public function __invoke(Request $request, int $eventId): JsonResponse
    {
        $event = $this->eventRepository->findById($eventId);

        try {
            $customer = $this->customerTokenResolver->resolve(
                $request->header(BookSlotActionPublic::CUSTOMER_TOKEN_HEADER),
                $event->getOrganizerId(),
            );

            $entry = $this->slotWaitlistService->join(
                $customer,
                $eventId,
                $this->localeService->getLocaleOrDefault($request->getPreferredLanguage()),
            );
        } catch (InvalidTicketLookupTokenException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_UNAUTHORIZED);
        } catch (GrottoNotPurchasedException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_FORBIDDEN);
        } catch (SlotBookingNotEnabledException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_NOT_FOUND);
        } catch (SlotsStillAvailableException|SlotAlreadyBookedException|ResourceConflictException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_CONFLICT);
        }

        return $this->resourceResponse(
            resource: WaitlistEntryResource::class,
            data: $entry,
            statusCode: ResponseCodes::HTTP_CREATED,
        );
    }
}
