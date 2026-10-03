<?php

namespace HiEvents\Services\Application\Handlers\Order;

use HiEvents\DomainObjects\Enums\PaymentProcessingFeeMode;
use HiEvents\DomainObjects\Generated\OrderDomainObjectAbstract;
use HiEvents\DomainObjects\OrderItemDomainObject;
use HiEvents\DomainObjects\OrganizerConfigurationDomainObject;
use HiEvents\DomainObjects\OrganizerStripePlatformDomainObject;
use HiEvents\DomainObjects\OrganizerVatSettingDomainObject;
use HiEvents\DomainObjects\StripePaymentDomainObject;
use HiEvents\Exceptions\ResourceConflictException;
use HiEvents\Exceptions\Stripe\CreatePaymentIntentFailedException;
use HiEvents\Exceptions\UnauthorizedException;
use HiEvents\Repository\Eloquent\Value\Relationship;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Services\Domain\Order\DTO\PaymentProcessingFeeQuoteDTO;
use HiEvents\Services\Domain\Order\PaymentProcessingFeeService;
use HiEvents\Services\Domain\Payment\Stripe\StripePaymentIntentAmountUpdateService;
use HiEvents\Services\Infrastructure\Stripe\StripeClientFactory;
use HiEvents\Services\Infrastructure\Stripe\StripeConfigurationService;
use Illuminate\Database\DatabaseManager;
use Throwable;

class SetPaymentProcessingFeeCoverageHandler
{
    public function __construct(
        private readonly GetPaymentProcessingFeeHandler $getPaymentProcessingFeeHandler,
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly PaymentProcessingFeeService $paymentProcessingFeeService,
        private readonly StripePaymentIntentAmountUpdateService $amountUpdateService,
        private readonly StripeClientFactory $stripeClientFactory,
        private readonly StripeConfigurationService $stripeConfigurationService,
        private readonly DatabaseManager $databaseManager,
    ) {}

    /**
     * @throws UnauthorizedException
     * @throws ResourceConflictException
     * @throws CreatePaymentIntentFailedException
     * @throws Throwable
     */
    public function handle(string $orderShortId, bool $cover): PaymentProcessingFeeQuoteDTO
    {
        $order = $this->getPaymentProcessingFeeHandler->findReservedOrder($orderShortId);
        $quote = $this->paymentProcessingFeeService->getQuote(
            $order,
            $this->getPaymentProcessingFeeHandler->getConfiguration($order),
        );

        if ($cover && $quote->mode !== PaymentProcessingFeeMode::COLLECT) {
            throw new ResourceConflictException(__('Payment processing fees cannot be collected for this order.'));
        }

        if ($cover === $quote->covered) {
            return $quote;
        }

        $fee = $cover ? $quote->fee : 0.0;

        $this->databaseManager->transaction(function () use ($order, $quote, $fee, $orderShortId) {
            $this->orderRepository->updateFromArray($order->getId(), [
                OrderDomainObjectAbstract::PAYMENT_PROCESSING_FEE => $fee,
                OrderDomainObjectAbstract::TOTAL_GROSS => $quote->totalWithoutFee + $fee,
            ]);

            $this->syncStripePaymentIntent($orderShortId);
        });

        return $this->getPaymentProcessingFeeHandler->handle($orderShortId);
    }

    /**
     * @throws CreatePaymentIntentFailedException
     */
    private function syncStripePaymentIntent(string $orderShortId): void
    {
        $order = $this->orderRepository
            ->loadRelation(new Relationship(OrderItemDomainObject::class))
            ->loadRelation(new Relationship(StripePaymentDomainObject::class, name: 'stripe_payment'))
            ->findByShortId($orderShortId);

        if ($order->getStripePayment() === null) {
            return;
        }

        $organizer = $this->organizerRepository
            ->loadRelation(OrganizerStripePlatformDomainObject::class)
            ->loadRelation(new Relationship(
                domainObject: OrganizerConfigurationDomainObject::class,
                name: 'organizer_configuration',
            ))
            ->loadRelation(new Relationship(
                domainObject: OrganizerVatSettingDomainObject::class,
                name: 'organizer_vat_setting',
            ))
            ->findById($this->getPaymentProcessingFeeHandler->findReservedOrder($orderShortId)->getEvent()->getOrganizerId());

        $stripePlatform = $organizer?->getActiveStripePlatform()
            ?? $this->stripeConfigurationService->getPrimaryPlatform();

        $this->amountUpdateService->updateAmount(
            stripeClient: $this->stripeClientFactory->createForPlatform($stripePlatform),
            stripePayment: $order->getStripePayment(),
            order: $order,
            configuration: $organizer?->getOrganizerConfiguration(),
            vatSettings: $organizer?->getOrganizerVatSetting(),
            stripeAccountId: $organizer?->getActiveStripeAccountId(),
        );
    }
}
