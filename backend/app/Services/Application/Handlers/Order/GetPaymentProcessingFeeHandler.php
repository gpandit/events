<?php

namespace HiEvents\Services\Application\Handlers\Order;

use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\OrganizerConfigurationDomainObject;
use HiEvents\DomainObjects\Status\OrderStatus;
use HiEvents\Exceptions\ResourceConflictException;
use HiEvents\Exceptions\UnauthorizedException;
use HiEvents\Repository\Eloquent\Value\Relationship;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Services\Domain\Order\DTO\PaymentProcessingFeeQuoteDTO;
use HiEvents\Services\Domain\Order\PaymentProcessingFeeService;
use HiEvents\Services\Infrastructure\Session\CheckoutSessionManagementService;

class GetPaymentProcessingFeeHandler
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly CheckoutSessionManagementService $sessionIdentifierService,
        private readonly PaymentProcessingFeeService $paymentProcessingFeeService,
    ) {}

    /**
     * @throws UnauthorizedException
     * @throws ResourceConflictException
     */
    public function handle(string $orderShortId): PaymentProcessingFeeQuoteDTO
    {
        $order = $this->findReservedOrder($orderShortId);

        return $this->paymentProcessingFeeService->getQuote($order, $this->getConfiguration($order));
    }

    /**
     * @throws UnauthorizedException
     * @throws ResourceConflictException
     */
    public function findReservedOrder(string $orderShortId): OrderDomainObject
    {
        $order = $this->orderRepository
            ->loadRelation(new Relationship(EventDomainObject::class, name: 'event'))
            ->findByShortId($orderShortId);

        if (! $order || ! $this->sessionIdentifierService->verifySession($order->getSessionId())) {
            throw new UnauthorizedException(__('Sorry, we could not verify your session. Please create a new order.'));
        }

        if ($order->getStatus() !== OrderStatus::RESERVED->name || $order->isReservedOrderExpired()) {
            throw new ResourceConflictException(__('Sorry, is expired or not in a valid state.'));
        }

        return $order;
    }

    public function getConfiguration(OrderDomainObject $order): ?OrganizerConfigurationDomainObject
    {
        return $this->organizerRepository
            ->loadRelation(new Relationship(
                domainObject: OrganizerConfigurationDomainObject::class,
                name: 'organizer_configuration',
            ))
            ->findById($order->getEvent()->getOrganizerId())
            ?->getOrganizerConfiguration();
    }
}
