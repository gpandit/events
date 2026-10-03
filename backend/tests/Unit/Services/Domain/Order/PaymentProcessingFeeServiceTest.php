<?php

namespace Tests\Unit\Services\Domain\Order;

use Brick\Money\Currency;
use HiEvents\DomainObjects\Enums\PaymentProcessingFeeMode;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\OrganizerConfigurationDomainObject;
use HiEvents\Services\Domain\Order\PaymentProcessingFeeService;
use HiEvents\Services\Infrastructure\CurrencyConversion\CurrencyConversionClientInterface;
use HiEvents\Values\MoneyValue;
use Illuminate\Config\Repository;
use PHPUnit\Framework\TestCase;

class PaymentProcessingFeeServiceTest extends TestCase
{
    private PaymentProcessingFeeService $service;

    protected function setUp(): void
    {
        $config = new Repository(['app' => [
            'payment_processing_fee_percentage' => 2.9,
            'payment_processing_fee_fixed' => 1,
            'payment_processing_fee_currency' => 'AED',
        ]]);

        $currencyConversionClient = $this->createMock(CurrencyConversionClientInterface::class);
        $currencyConversionClient->method('convert')->willReturnCallback(
            fn (Currency $from, Currency $to, float $amount) => MoneyValue::fromFloat($amount * 0.5, $to->getCurrencyCode())
        );

        $this->service = new PaymentProcessingFeeService($config, $currencyConversionClient);
    }

    private function configuration(string $mode): OrganizerConfigurationDomainObject
    {
        $configuration = $this->createMock(OrganizerConfigurationDomainObject::class);
        $configuration->method('getPaymentProcessingFeeMode')->willReturn($mode);

        return $configuration;
    }

    private function order(float $totalGross, float $coveredFee = 0.0, string $currency = 'AED'): OrderDomainObject
    {
        return (new OrderDomainObject)
            ->setTotalGross($totalGross)
            ->setPaymentProcessingFee($coveredFee)
            ->setCurrency($currency);
    }

    public function test_fee_is_grossed_up_so_net_after_stripe_charges_equals_total(): void
    {
        $fee = $this->service->calculateFee(100.00, 'AED');

        $this->assertSame(4.02, $fee);
        $this->assertEqualsWithDelta(100.00, (100.00 + $fee) - ((100.00 + $fee) * 0.029 + 1.0), 0.01);
    }

    public function test_fee_is_zero_for_free_orders(): void
    {
        $this->assertSame(0.0, $this->service->calculateFee(0.0, 'AED'));
    }

    public function test_fixed_fee_is_converted_to_order_currency(): void
    {
        $this->assertSame(3.50, $this->service->calculateFee(100.00, 'USD'));
    }

    public function test_hide_mode_returns_no_fee(): void
    {
        $quote = $this->service->getQuote($this->order(100.00), $this->configuration('HIDE'));

        $this->assertSame(PaymentProcessingFeeMode::HIDE, $quote->mode);
        $this->assertSame(0.0, $quote->fee);
        $this->assertFalse($quote->covered);
    }

    public function test_missing_configuration_defaults_to_hide(): void
    {
        $quote = $this->service->getQuote($this->order(100.00), null);

        $this->assertSame(PaymentProcessingFeeMode::HIDE, $quote->mode);
        $this->assertSame(0.0, $quote->fee);
    }

    public function test_show_mode_returns_fee_on_final_amount(): void
    {
        $quote = $this->service->getQuote($this->order(100.00), $this->configuration('SHOW'));

        $this->assertSame(PaymentProcessingFeeMode::SHOW, $quote->mode);
        $this->assertSame(4.02, $quote->fee);
        $this->assertSame(100.00, $quote->totalWithoutFee);
        $this->assertSame(104.02, $quote->totalWithFee);
    }

    public function test_collect_mode_quote_is_stable_once_fee_is_covered(): void
    {
        $quote = $this->service->getQuote($this->order(104.02, 4.02), $this->configuration('COLLECT'));

        $this->assertSame(PaymentProcessingFeeMode::COLLECT, $quote->mode);
        $this->assertTrue($quote->covered);
        $this->assertSame(100.00, $quote->totalWithoutFee);
        $this->assertSame(4.02, $quote->fee);
        $this->assertSame(104.02, $quote->totalWithFee);
    }

    public function test_free_order_has_no_fee_in_collect_mode(): void
    {
        $quote = $this->service->getQuote($this->order(0.0), $this->configuration('COLLECT'));

        $this->assertSame(0.0, $quote->fee);
    }
}
