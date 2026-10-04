<?php

namespace Tests\Unit\Services\Domain\Payment\Stripe;

use HiEvents\DomainObjects\AccountDomainObject;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\StripeCustomerDomainObject;
use HiEvents\Exceptions\Stripe\CreatePaymentIntentFailedException;
use HiEvents\Repository\Interfaces\StripeCustomerRepositoryInterface;
use HiEvents\Services\Domain\Order\OrderApplicationFeeCalculationService;
use HiEvents\Services\Domain\Payment\Stripe\DTOs\CreatePaymentIntentRequestDTO;
use HiEvents\Services\Domain\Payment\Stripe\StripePaymentIntentCreationService;
use HiEvents\Values\MoneyValue;
use Illuminate\Config\Repository;
use Illuminate\Database\DatabaseManager;
use Mockery;
use Psr\Log\NullLogger;
use Stripe\Customer;
use Stripe\Exception\InvalidRequestException;
use Stripe\PaymentIntent;
use Stripe\Service\CustomerService;
use Stripe\Service\PaymentIntentService;
use Stripe\StripeClient;
use Tests\TestCase;

class StripePaymentIntentCreationServiceStaleCustomerTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_a_customer_missing_in_stripe_is_replaced_and_the_intent_retried_once(): void
    {
        $databaseManager = Mockery::mock(DatabaseManager::class);
        $databaseManager->shouldReceive('beginTransaction');
        $databaseManager->shouldReceive('rollBack')->once();
        $databaseManager->shouldReceive('commit')->once();

        $customerRepository = Mockery::mock(StripeCustomerRepositoryInterface::class);
        $customerRepository->shouldReceive('findFirstWhere')->twice()->andReturn(
            (new StripeCustomerDomainObject)->setId(3)->setStripeCustomerId('cus_old')->setName('Jane Buyer'),
            null,
        );
        $customerRepository->shouldReceive('deleteWhere')->once()->with(['email' => 'jane@example.com', 'stripe_account_id' => null])->andReturn(1);
        $customerRepository->shouldReceive('create')->once()->andReturn(
            (new StripeCustomerDomainObject)->setId(4)->setStripeCustomerId('cus_new')->setName('Jane Buyer'),
        );

        $paymentIntents = Mockery::mock(PaymentIntentService::class);
        $paymentIntents->shouldReceive('create')->once()
            ->withArgs(fn (array $params) => $params['customer'] === 'cus_old')
            ->andThrow($this->missingCustomerError());
        $paymentIntents->shouldReceive('create')->once()
            ->withArgs(fn (array $params) => $params['customer'] === 'cus_new')
            ->andReturn(PaymentIntent::constructFrom(['id' => 'pi_live', 'client_secret' => 'secret']));

        $customers = Mockery::mock(CustomerService::class);
        $customers->shouldReceive('create')->once()->andReturn(Customer::constructFrom(['id' => 'cus_new', 'name' => 'Jane Buyer', 'email' => 'jane@example.com']));

        $client = Mockery::mock(StripeClient::class);
        $client->paymentIntents = $paymentIntents;
        $client->customers = $customers;

        $response = $this->service($databaseManager, $customerRepository)
            ->createPaymentIntentWithClient($client, $this->request());

        $this->assertSame('pi_live', $response->paymentIntentId);
    }

    public function test_the_retry_happens_only_once(): void
    {
        $databaseManager = Mockery::mock(DatabaseManager::class);
        $databaseManager->shouldReceive('beginTransaction');
        $databaseManager->shouldReceive('rollBack');

        $customerRepository = Mockery::mock(StripeCustomerRepositoryInterface::class);
        $customerRepository->shouldReceive('findFirstWhere')->andReturn(
            (new StripeCustomerDomainObject)->setId(3)->setStripeCustomerId('cus_old')->setName('Jane Buyer'),
        );
        $customerRepository->shouldReceive('deleteWhere')->once()->andReturn(1);

        $paymentIntents = Mockery::mock(PaymentIntentService::class);
        $paymentIntents->shouldReceive('create')->twice()->andThrow($this->missingCustomerError());

        $client = Mockery::mock(StripeClient::class);
        $client->paymentIntents = $paymentIntents;

        $this->expectException(CreatePaymentIntentFailedException::class);

        $this->service($databaseManager, $customerRepository)
            ->createPaymentIntentWithClient($client, $this->request());
    }

    private function missingCustomerError(): InvalidRequestException
    {
        return InvalidRequestException::factory(
            "No such customer: 'cus_old'",
            404,
            null,
            null,
            null,
            'resource_missing',
        );
    }

    private function service(DatabaseManager $databaseManager, StripeCustomerRepositoryInterface $customerRepository): StripePaymentIntentCreationService
    {
        return new StripePaymentIntentCreationService(
            logger: new NullLogger,
            config: new Repository(['app' => ['saas_mode_enabled' => false]]),
            stripeCustomerRepository: $customerRepository,
            databaseManager: $databaseManager,
            orderApplicationFeeCalculationService: Mockery::mock(OrderApplicationFeeCalculationService::class),
        );
    }

    private function request(): CreatePaymentIntentRequestDTO
    {
        return new CreatePaymentIntentRequestDTO(
            amount: MoneyValue::fromFloat(50.0, 'AED'),
            currencyCode: 'AED',
            account: (new AccountDomainObject)->setId(9),
            order: (new OrderDomainObject)->setId(1)->setEventId(2)->setShortId('o_1')
                ->setEmail('jane@example.com')->setFirstName('Jane')->setLastName('Buyer'),
        );
    }
}
