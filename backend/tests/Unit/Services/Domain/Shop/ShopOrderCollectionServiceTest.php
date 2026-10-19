<?php

namespace Tests\Unit\Services\Domain\Shop;

use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\DomainObjects\EventSettingDomainObject;
use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Exceptions\EventNotAShopException;
use HiEvents\Mail\Order\OrderReadyForCollectionEmail;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\OrderRepositoryInterface;
use HiEvents\Services\Domain\Shop\ShopOrderCollectionService;
use HiEvents\Services\Domain\Shop\ShopOrderDetailsService;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Contracts\Mail\PendingMail;
use Illuminate\Support\Collection;
use Mockery as m;
use Tests\TestCase;

class ShopOrderCollectionServiceTest extends TestCase
{
    private OrderRepositoryInterface $orderRepository;

    private EventRepositoryInterface $eventRepository;

    private Mailer $mailer;

    private ShopOrderCollectionService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->orderRepository = m::mock(OrderRepositoryInterface::class);
        $this->eventRepository = m::mock(EventRepositoryInterface::class);
        $this->mailer = m::mock(Mailer::class);

        $this->eventRepository->shouldReceive('loadRelation')->andReturnSelf();
        $this->orderRepository->shouldReceive('loadRelation')->andReturnSelf();

        $this->service = new ShopOrderCollectionService(
            $this->orderRepository,
            $this->eventRepository,
            new ShopOrderDetailsService,
            $this->mailer,
        );
    }

    public function test_marking_ready_updates_each_pending_order_and_emails_the_buyer(): void
    {
        $this->eventRepository->shouldReceive('findById')->with(5)->andReturn($this->shop(true));

        $this->orderRepository->shouldReceive('findWhere')->once()->andReturn(new Collection([
            $this->order(1, 'a@example.com'),
            $this->order(2, 'b@example.com'),
        ]));

        $this->orderRepository->shouldReceive('updateFromArray')
            ->twice()
            ->withArgs(fn (int $id, array $attributes) => in_array($id, [1, 2], true)
                && $attributes['collection_status'] === 'READY'
                && isset($attributes['ready_for_collection_at']));

        $sent = [];
        $this->mailer->shouldReceive('to')->twice()->andReturnUsing(function (string $email) use (&$sent) {
            $pending = m::mock(PendingMail::class);
            $pending->shouldReceive('locale')->andReturnSelf();
            $pending->shouldReceive('send')->once()->andReturnUsing(function ($mailable) use (&$sent, $email) {
                $sent[$email] = $mailable;
            });

            return $pending;
        });

        $this->assertSame(2, $this->service->markReady(5, [1, 2]));
        $this->assertCount(2, $sent);
        $this->assertContainsOnlyInstancesOf(OrderReadyForCollectionEmail::class, $sent);
    }

    public function test_marking_ready_with_no_pending_orders_sends_nothing(): void
    {
        $this->eventRepository->shouldReceive('findById')->andReturn($this->shop(true));
        $this->orderRepository->shouldReceive('findWhere')->andReturn(new Collection);
        $this->orderRepository->shouldNotReceive('updateFromArray');
        $this->mailer->shouldNotReceive('to');

        $this->assertSame(0, $this->service->markReady(5, [1]));
    }

    public function test_marking_collected_updates_completed_orders_of_the_shop(): void
    {
        $this->eventRepository->shouldReceive('findById')->andReturn($this->shop(true));

        $this->orderRepository->shouldReceive('updateWhere')
            ->once()
            ->withArgs(fn (array $attributes, array $where) => $attributes['collection_status'] === 'COLLECTED'
                && $where['event_id'] === 5
                && $where['status'] === 'COMPLETED')
            ->andReturn(3);

        $this->assertSame(3, $this->service->markCollected(5, [1, 2, 3]));
    }

    public function test_events_that_are_not_shops_are_rejected(): void
    {
        $this->eventRepository->shouldReceive('findById')->andReturn($this->shop(false));
        $this->orderRepository->shouldNotReceive('updateWhere');

        $this->expectException(EventNotAShopException::class);

        $this->service->markCollected(5, [1]);
    }

    private function shop(bool $isShop): EventDomainObject
    {
        return (new EventDomainObject)
            ->setId(5)
            ->setTitle('Uniform Co')
            ->setIsShop($isShop)
            ->setOrganizer((new OrganizerDomainObject)->setName('School'))
            ->setEventSettings((new EventSettingDomainObject)->setSupportEmail('shop@example.com'));
    }

    private function order(int $id, string $email): OrderDomainObject
    {
        return (new OrderDomainObject)
            ->setId($id)
            ->setPublicId("O-$id")
            ->setFirstName('Sara')
            ->setLastName('Buyer')
            ->setEmail($email)
            ->setLocale('en');
    }
}
