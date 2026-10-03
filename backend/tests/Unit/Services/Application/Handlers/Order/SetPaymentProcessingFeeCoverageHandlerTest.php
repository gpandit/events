<?php

namespace Tests\Unit\Services\Application\Handlers\Order;

use HiEvents\DomainObjects\Enums\PaymentProcessingFeeMode;
use HiEvents\DomainObjects\Generated\OrderDomainObjectAbstract;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\Exceptions\ResourceConflictException;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Order\GetPaymentProcessingFeeHandler;
use HiEvents\Services\Application\Handlers\Order\SetPaymentProcessingFeeCoverageHandler;
use HiEvents\Services\Domain\Order\DTO\PaymentProcessingFeeQuoteDTO;
use HiEvents\Services\Domain\Order\PaymentProcessingFeeService;
use HiEvents\Services\Domain\Payment\Stripe\StripePaymentIntentAmountUpdateService;
use HiEvents\Services\Infrastructure\Stripe\StripeClientFactory;
use HiEvents\Services\Infrastructure\Stripe\StripeConfigurationService;
use Illuminate\Database\DatabaseManager;
use Mockery as m;
use Mockery\MockInterface;
use Tests\TestCase;

class SetPaymentProcessingFeeCoverageHandlerTest extends TestCase
{
    private MockInterface $getHandler;

    private MockInterface $orderRepository;

    private MockInterface $feeService;

    private MockInterface $databaseManager;

    private SetPaymentProcessingFeeCoverageHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->getHandler = m::mock(GetPaymentProcessingFeeHandler::class);
        $this->orderRepository = m::mock(OrderRepositoryInterface::class);
        $this->feeService = m::mock(PaymentProcessingFeeService::class);
        $this->databaseManager = m::mock(DatabaseManager::class);

        $this->handler = new SetPaymentProcessingFeeCoverageHandler(
            $this->getHandler,
            $this->orderRepository,
            m::mock(OrganizerRepositoryInterface::class),
            $this->feeService,
            m::mock(StripePaymentIntentAmountUpdateService::class),
            m::mock(StripeClientFactory::class),
            m::mock(StripeConfigurationService::class),
            $this->databaseManager,
        );
    }

    private function quote(PaymentProcessingFeeMode $mode, bool $covered = false): PaymentProcessingFeeQuoteDTO
    {
        return new PaymentProcessingFeeQuoteDTO(
            mode: $mode,
            fee: 4.02,
            covered: $covered,
            totalWithoutFee: 100.00,
            totalWithFee: 104.02,
            currency: 'AED',
        );
    }

    private function expectQuote(PaymentProcessingFeeQuoteDTO $quote): OrderDomainObject
    {
        $order = (new OrderDomainObject)->setId(7);

        $this->getHandler->shouldReceive('findReservedOrder')->with('ABC')->andReturn($order);
        $this->getHandler->shouldReceive('getConfiguration')->with($order)->andReturnNull();
        $this->feeService->shouldReceive('getQuote')->andReturn($quote);

        return $order;
    }

    public function test_rejects_covering_the_fee_when_mode_is_not_collect(): void
    {
        $this->expectQuote($this->quote(PaymentProcessingFeeMode::SHOW));
        $this->orderRepository->shouldNotReceive('updateFromArray');

        $this->expectException(ResourceConflictException::class);

        $this->handler->handle('ABC', true);
    }

    public function test_removing_coverage_is_allowed_when_mode_is_no_longer_collect(): void
    {
        $order = $this->expectQuote($this->quote(PaymentProcessingFeeMode::SHOW, covered: true));
        $uncoveredQuote = $this->quote(PaymentProcessingFeeMode::SHOW);

        $this->databaseManager->shouldReceive('transaction')->once()->andReturnUsing(fn (callable $callback) => $callback());
        $this->orderRepository->shouldReceive('updateFromArray')->once()->with($order->getId(), [
            OrderDomainObjectAbstract::PAYMENT_PROCESSING_FEE => 0.0,
            OrderDomainObjectAbstract::TOTAL_GROSS => 100.00,
        ]);
        $this->orderRepository->shouldReceive('loadRelation')->andReturnSelf();
        $this->orderRepository->shouldReceive('findByShortId')->with('ABC')->andReturn(new OrderDomainObject);
        $this->getHandler->shouldReceive('handle')->with('ABC')->andReturn($uncoveredQuote);

        $this->assertSame($uncoveredQuote, $this->handler->handle('ABC', false));
    }

    public function test_returns_current_quote_when_coverage_is_unchanged(): void
    {
        $quote = $this->quote(PaymentProcessingFeeMode::COLLECT, covered: true);
        $this->expectQuote($quote);
        $this->orderRepository->shouldNotReceive('updateFromArray');

        $this->assertSame($quote, $this->handler->handle('ABC', true));
    }

    public function test_covering_the_fee_adds_it_to_the_order_total(): void
    {
        $order = $this->expectQuote($this->quote(PaymentProcessingFeeMode::COLLECT));
        $coveredQuote = $this->quote(PaymentProcessingFeeMode::COLLECT, covered: true);

        $this->databaseManager->shouldReceive('transaction')->once()->andReturnUsing(fn (callable $callback) => $callback());
        $this->orderRepository->shouldReceive('updateFromArray')->once()->with($order->getId(), [
            OrderDomainObjectAbstract::PAYMENT_PROCESSING_FEE => 4.02,
            OrderDomainObjectAbstract::TOTAL_GROSS => 104.02,
        ]);
        $this->orderRepository->shouldReceive('loadRelation')->andReturnSelf();
        $this->orderRepository->shouldReceive('findByShortId')->with('ABC')->andReturn(new OrderDomainObject);
        $this->getHandler->shouldReceive('handle')->with('ABC')->andReturn($coveredQuote);

        $this->assertSame($coveredQuote, $this->handler->handle('ABC', true));
    }

    public function test_removing_coverage_restores_the_original_total(): void
    {
        $order = $this->expectQuote($this->quote(PaymentProcessingFeeMode::COLLECT, covered: true));
        $uncoveredQuote = $this->quote(PaymentProcessingFeeMode::COLLECT);

        $this->databaseManager->shouldReceive('transaction')->once()->andReturnUsing(fn (callable $callback) => $callback());
        $this->orderRepository->shouldReceive('updateFromArray')->once()->with($order->getId(), [
            OrderDomainObjectAbstract::PAYMENT_PROCESSING_FEE => 0.0,
            OrderDomainObjectAbstract::TOTAL_GROSS => 100.00,
        ]);
        $this->orderRepository->shouldReceive('loadRelation')->andReturnSelf();
        $this->orderRepository->shouldReceive('findByShortId')->with('ABC')->andReturn(new OrderDomainObject);
        $this->getHandler->shouldReceive('handle')->with('ABC')->andReturn($uncoveredQuote);

        $this->assertSame($uncoveredQuote, $this->handler->handle('ABC', false));
    }
}
