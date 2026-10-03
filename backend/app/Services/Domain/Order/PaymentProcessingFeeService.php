<?php

namespace HiEvents\Services\Domain\Order;

use Brick\Money\Currency as BrickCurrency;
use HiEvents\DomainObjects\Enums\PaymentProcessingFeeMode;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\OrganizerConfigurationDomainObject;
use HiEvents\Helper\Currency;
use HiEvents\Services\Domain\Order\DTO\PaymentProcessingFeeQuoteDTO;
use HiEvents\Services\Infrastructure\CurrencyConversion\CurrencyConversionClientInterface;
use Illuminate\Config\Repository;

class PaymentProcessingFeeService
{
    public function __construct(
        private readonly Repository $config,
        private readonly CurrencyConversionClientInterface $currencyConversionClient,
    ) {}

    public function calculateFee(float $totalWithoutFee, string $currency): float
    {
        if ($totalWithoutFee <= 0) {
            return 0.0;
        }

        $rate = (float) $this->config->get('app.payment_processing_fee_percentage') / 100;
        $fixedFee = $this->getFixedFee($currency);

        return Currency::round(($fixedFee + ($totalWithoutFee * $rate)) / (1 - $rate));
    }

    public function getQuote(
        OrderDomainObject $order,
        ?OrganizerConfigurationDomainObject $configuration,
    ): PaymentProcessingFeeQuoteDTO {
        $mode = PaymentProcessingFeeMode::tryFrom($configuration?->getPaymentProcessingFeeMode() ?? '')
            ?? PaymentProcessingFeeMode::HIDE;

        $coveredFee = (float) $order->getPaymentProcessingFee();
        $totalWithoutFee = Currency::round($order->getTotalGross() - $coveredFee);
        $fee = $mode === PaymentProcessingFeeMode::HIDE || ! $order->isPaymentRequired()
            ? 0.0
            : $this->calculateFee($totalWithoutFee, $order->getCurrency());

        return new PaymentProcessingFeeQuoteDTO(
            mode: $mode,
            fee: $fee,
            covered: $coveredFee > 0,
            totalWithoutFee: $totalWithoutFee,
            totalWithFee: Currency::round($totalWithoutFee + $fee),
            currency: $order->getCurrency(),
        );
    }

    private function getFixedFee(string $currency): float
    {
        $fixedFee = (float) $this->config->get('app.payment_processing_fee_fixed');
        $feeCurrency = $this->config->get('app.payment_processing_fee_currency');

        if (strtoupper($currency) === strtoupper($feeCurrency)) {
            return $fixedFee;
        }

        return $this->currencyConversionClient->convert(
            fromCurrency: BrickCurrency::of($feeCurrency),
            toCurrency: BrickCurrency::of($currency),
            amount: $fixedFee,
        )->toFloat();
    }
}
