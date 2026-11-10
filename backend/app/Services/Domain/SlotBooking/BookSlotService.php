<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\Generated\ProductPriceDomainObjectAbstract;
use HiEvents\DomainObjects\Generated\SlotBookingConfigDomainObjectAbstract;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\SlotBookingConfigDomainObject;
use HiEvents\Enterprise\Seating\Services\Domain\SeatingEventLockService;
use HiEvents\Exceptions\SlotAlreadyBookedException;
use HiEvents\Exceptions\SlotBookingNotEnabledException;
use HiEvents\Repository\Interfaces\ProductPriceRepositoryInterface;
use HiEvents\Repository\Interfaces\SlotBookingConfigRepositoryInterface;
use HiEvents\Services\Application\Handlers\Order\CompleteOrderHandler;
use HiEvents\Services\Application\Handlers\Order\CreateOrderHandler;
use HiEvents\Services\Application\Handlers\Order\DTO\CompleteOrderDTO;
use HiEvents\Services\Application\Handlers\Order\DTO\CompleteOrderOrderDTO;
use HiEvents\Services\Application\Handlers\Order\DTO\CompleteOrderProductDataDTO;
use HiEvents\Services\Application\Handlers\Order\DTO\CreateOrderPublicDTO;
use HiEvents\Services\Application\Handlers\Order\DTO\ProductOrderDetailsDTO;
use HiEvents\Services\Domain\Order\OrderCancelService;
use HiEvents\Services\Domain\Product\DTO\OrderProductPriceDTO;
use HiEvents\Services\Domain\SlotBooking\DTO\BookSlotDTO;
use Illuminate\Database\DatabaseManager;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class BookSlotService
{
    public function __construct(
        private readonly DatabaseManager $databaseManager,
        private readonly SeatingEventLockService $eventLock,
        private readonly SlotBookingConfigRepositoryInterface $configRepository,
        private readonly ProductPriceRepositoryInterface $productPriceRepository,
        private readonly ActiveSlotBookingFinder $activeBookingFinder,
        private readonly OrderCancelService $orderCancelService,
        private readonly CreateOrderHandler $createOrderHandler,
        private readonly CompleteOrderHandler $completeOrderHandler,
        private readonly Request $request,
    ) {}

    /**
     * @throws SlotBookingNotEnabledException
     * @throws SlotAlreadyBookedException
     * @throws ValidationException
     * @throws Throwable
     */
    public function book(BookSlotDTO $dto): OrderDomainObject
    {
        return $this->databaseManager->transaction(function () use ($dto) {
            $this->eventLock->lock($dto->event_id);

            $config = $this->getConfig($dto->event_id);
            $this->assertChildCount($dto, $config);
            $this->releaseExistingBooking($dto);

            $sessionId = $this->pinCheckoutSession();

            $priceId = $this->productPriceRepository->findFirstWhere([
                ProductPriceDomainObjectAbstract::PRODUCT_ID => $config->getProductId(),
            ])->getId();

            $order = $this->createOrderHandler->handle(
                eventId: $dto->event_id,
                createOrderPublicDTO: new CreateOrderPublicDTO(
                    products: collect([new ProductOrderDetailsDTO(
                        product_id: $config->getProductId(),
                        quantities: collect([new OrderProductPriceDTO(
                            quantity: count($dto->children),
                            price_id: $priceId,
                        )]),
                        event_occurrence_id: $dto->event_occurrence_id,
                    )]),
                    is_user_authenticated: $dto->is_staff,
                    session_identifier: $sessionId,
                    order_locale: $dto->locale,
                ),
                deleteExistingOrdersForSession: false,
            );

            return $this->completeOrderHandler->handle(
                $order->getShortId(),
                $this->buildCompleteOrderDTO($dto, $priceId),
            );
        });
    }

    private function pinCheckoutSession(): string
    {
        $sessionId = sha1(Str::uuid().Str::random(40));
        $this->request->query->set('session_identifier', $sessionId);

        return $sessionId;
    }

    /**
     * @throws SlotBookingNotEnabledException
     */
    private function getConfig(int $eventId): SlotBookingConfigDomainObject
    {
        $config = $this->configRepository->findFirstWhere([
            SlotBookingConfigDomainObjectAbstract::EVENT_ID => $eventId,
        ]);

        if ($config === null) {
            throw new SlotBookingNotEnabledException(__('Slot booking is not enabled for this event'));
        }

        return $config;
    }

    /**
     * @throws ValidationException
     */
    private function assertChildCount(BookSlotDTO $dto, SlotBookingConfigDomainObject $config): void
    {
        $count = count($dto->children);

        if ($count < 1 || $count > $config->getChildrenPerSlot()) {
            throw ValidationException::withMessages([
                'children' => [__('You can book between 1 and :max children per slot', ['max' => $config->getChildrenPerSlot()])],
            ]);
        }
    }

    /**
     * @throws SlotAlreadyBookedException
     * @throws Throwable
     */
    private function releaseExistingBooking(BookSlotDTO $dto): void
    {
        if ($dto->is_staff) {
            return;
        }

        $existing = $this->activeBookingFinder->findActiveOrder($dto->event_id, $dto->email);

        if ($existing === null) {
            return;
        }

        if (! $dto->replace) {
            throw new SlotAlreadyBookedException(
                __('You already have a Santa visit booked. Confirm to replace it with this slot.')
            );
        }

        $this->orderCancelService->cancelOrder($existing);
    }

    private function buildCompleteOrderDTO(BookSlotDTO $dto, int $priceId): CompleteOrderDTO
    {
        $email = mb_strtolower(trim($dto->email));

        return new CompleteOrderDTO(
            order: new CompleteOrderOrderDTO(
                first_name: $dto->first_name,
                last_name: $dto->last_name,
                email: $email,
                questions: null,
            ),
            products: collect($dto->children)->map(fn (array $child) => new CompleteOrderProductDataDTO(
                product_price_id: $priceId,
                first_name: $child['first_name'],
                last_name: ($child['last_name'] ?? null) ?: $dto->last_name,
                email: $email,
            )),
            event_id: $dto->event_id,
        );
    }
}
