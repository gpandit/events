<?php

namespace Tests\Unit\Services\Domain\PersonalData;

use HiEvents\DomainObjects\DataErasureRequestDomainObject;
use HiEvents\Repository\Interfaces\DataErasureRequestRepositoryInterface;
use HiEvents\Services\Domain\PersonalData\PersonalDataErasureService;
use Illuminate\Database\DatabaseManager;
use Mockery as m;
use Tests\TestCase;

class PersonalDataErasureServiceTest extends TestCase
{
    public function test_it_anonymises_every_pii_store_and_records_the_erased_orders_without_the_email(): void
    {
        $repository = m::mock(DataErasureRequestRepositoryInterface::class);
        $db = m::mock(DatabaseManager::class);
        $db->shouldReceive('transaction')->once()->andReturnUsing(fn (callable $callback) => $callback());

        $repository->shouldReceive('anonymiseOrders')->once()->with('parent@example.com')->andReturn([4, 9]);
        $repository->shouldReceive('anonymiseAttendees')->once()->with('parent@example.com', [4, 9])->andReturn(3);
        $repository->shouldReceive('scrubOrderRelatedRecords')->once()->with([4, 9]);
        $repository->shouldReceive('anonymiseWaitlistEntries')->once()->with('parent@example.com');
        $repository->shouldReceive('anonymiseStripeCustomers')->once()->with('parent@example.com');
        $repository->shouldReceive('deleteCustomerAccounts')->once()->with('parent@example.com');
        $repository->shouldReceive('deleteTicketLookupTokens')->once()->with('parent@example.com');
        $repository->shouldReceive('deleteChildRecords')->once()->with('parent@example.com')->andReturn(2);

        $logged = new DataErasureRequestDomainObject;
        $repository->shouldReceive('create')
            ->once()
            ->with(m::on(function (array $attributes) {
                return $attributes['order_ids'] === '[4,9]'
                    && $attributes['orders_count'] === 2
                    && $attributes['attendees_count'] === 3
                    && $attributes['child_records_count'] === 2
                    && $attributes['email_hash'] === hash_hmac('sha256', 'parent@example.com', (string) config('app.key'))
                    && ! str_contains(json_encode($attributes), 'parent@example.com');
            }))
            ->andReturn($logged);

        $result = (new PersonalDataErasureService($repository, $db))->erase(' Parent@Example.com ');

        $this->assertSame($logged, $result);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
