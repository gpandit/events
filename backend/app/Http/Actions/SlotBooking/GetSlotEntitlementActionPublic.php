<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\SlotBooking;

use HiEvents\Exceptions\InvalidTicketLookupTokenException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\ResponseCodes;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\SlotBookingConfigRepositoryInterface;
use HiEvents\Services\Domain\Customer\CustomerTokenResolver;
use HiEvents\Services\Domain\SlotBooking\SlotEntitlementSummaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetSlotEntitlementActionPublic extends BaseAction
{
    public function __construct(
        private readonly CustomerTokenResolver $customerTokenResolver,
        private readonly EventRepositoryInterface $eventRepository,
        private readonly SlotBookingConfigRepositoryInterface $configRepository,
        private readonly SlotEntitlementSummaryService $summaryService,
    ) {}

    /**
     * Get the signed-in customer's Grotto entitlement
     *
     * Returns how many Grotto tickets the customer holds and how many more they may still buy.
     * Requires a logged-in customer (`X-Customer-Token`).
     */
    public function __invoke(Request $request, int $eventId): JsonResponse
    {
        $event = $this->eventRepository->findById($eventId);

        try {
            $customer = $this->customerTokenResolver->resolve(
                $request->header(BookSlotActionPublic::CUSTOMER_TOKEN_HEADER),
                $event->getOrganizerId(),
            );
        } catch (InvalidTicketLookupTokenException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_UNAUTHORIZED);
        }

        $config = $this->configRepository->findFirstWhere(['event_id' => $eventId]);

        if ($config === null) {
            return $this->notFoundResponse();
        }

        return $this->jsonResponse($this->summaryService->summarise($config, $customer->getEmail()), wrapInData: true);
    }
}
