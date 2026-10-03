<?php

namespace HiEvents\Services\Domain\Payment\Stripe;

use HiEvents\DomainObjects\Generated\StripePaymentDomainObjectAbstract;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\OrganizerConfigurationDomainObject;
use HiEvents\DomainObjects\OrganizerVatSettingDomainObject;
use HiEvents\DomainObjects\StripePaymentDomainObject;
use HiEvents\Exceptions\Stripe\CreatePaymentIntentFailedException;
use HiEvents\Repository\Interfaces\StripePaymentsRepositoryInterface;
use HiEvents\Services\Domain\Order\OrderApplicationFeeCalculationService;
use HiEvents\Values\MoneyValue;
use Psr\Log\LoggerInterface;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripePaymentIntentAmountUpdateService
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly OrderApplicationFeeCalculationService $orderApplicationFeeCalculationService,
        private readonly StripePaymentsRepositoryInterface $stripePaymentsRepository,
    ) {}

    /**
     * @throws CreatePaymentIntentFailedException
     */
    public function updateAmount(
        StripeClient $stripeClient,
        StripePaymentDomainObject $stripePayment,
        OrderDomainObject $order,
        ?OrganizerConfigurationDomainObject $configuration,
        ?OrganizerVatSettingDomainObject $vatSettings,
        ?string $stripeAccountId,
    ): void {
        $applicationFee = $configuration
            ? $this->orderApplicationFeeCalculationService->calculateApplicationFee($configuration, $order, $vatSettings)
            : null;
        $chargeApplicationFee = $applicationFee && ! $configuration->getBypassApplicationFees();

        try {
            $stripeClient->paymentIntents->update(
                $stripePayment->getPaymentIntentId(),
                [
                    'amount' => MoneyValue::fromFloat($order->getTotalGross(), $order->getCurrency())->toMinorUnit(),
                    ...($chargeApplicationFee ? ['application_fee_amount' => $applicationFee->grossApplicationFee->toMinorUnit()] : []),
                ],
                $stripeAccountId ? ['stripe_account' => $stripeAccountId] : [],
            );
        } catch (ApiErrorException $exception) {
            $this->logger->error("Stripe payment intent amount update failed: {$exception->getMessage()}", [
                'exception' => $exception,
                'paymentIntentId' => $stripePayment->getPaymentIntentId(),
            ]);

            throw new CreatePaymentIntentFailedException(
                __('There was an error communicating with the payment provider. Please try again later.')
            );
        }

        if ($applicationFee) {
            $this->stripePaymentsRepository->updateFromArray($stripePayment->getId(), [
                StripePaymentDomainObjectAbstract::APPLICATION_FEE_GROSS => $applicationFee->grossApplicationFee->toMinorUnit(),
                StripePaymentDomainObjectAbstract::APPLICATION_FEE_NET => $applicationFee->netApplicationFee->toMinorUnit(),
                StripePaymentDomainObjectAbstract::APPLICATION_FEE_VAT => $applicationFee->applicationFeeVatAmount?->toMinorUnit() ?? 0,
                StripePaymentDomainObjectAbstract::APPLICATION_FEE_VAT_RATE => $applicationFee->applicationFeeVatRate,
            ]);
        }
    }
}
