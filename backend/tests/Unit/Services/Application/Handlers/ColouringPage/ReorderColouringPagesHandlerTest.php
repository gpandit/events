<?php

namespace Tests\Unit\Services\Application\Handlers\ColouringPage;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use HiEvents\Services\Application\Handlers\ColouringPage\ReorderColouringPagesHandler;
use Illuminate\Database\DatabaseManager;
use Illuminate\Support\Collection;
use Mockery as m;
use Tests\TestCase;

class ReorderColouringPagesHandlerTest extends TestCase
{
    private ColouringPageRepositoryInterface $repository;

    private DatabaseManager $databaseManager;

    private ReorderColouringPagesHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = m::mock(ColouringPageRepositoryInterface::class);
        $this->databaseManager = m::mock(DatabaseManager::class);
        $this->handler = new ReorderColouringPagesHandler($this->repository, $this->databaseManager);
    }

    public function test_handle_stores_the_position_of_each_page(): void
    {
        $this->repository->shouldReceive('findOwnedPages')
            ->once()
            ->with([3, 1, 2], 10)
            ->andReturn(new Collection([new ColouringPageDomainObject, new ColouringPageDomainObject, new ColouringPageDomainObject]));
        $this->databaseManager->shouldReceive('transaction')->once()->andReturnUsing(fn (callable $callback) => $callback());
        $this->repository->shouldReceive('updateFromArray')->once()->with(3, ['sort_order' => 0]);
        $this->repository->shouldReceive('updateFromArray')->once()->with(1, ['sort_order' => 1]);
        $this->repository->shouldReceive('updateFromArray')->once()->with(2, ['sort_order' => 2]);

        $this->handler->handle(10, [3, 1, 2]);

        $this->addToAssertionCount(1);
    }

    public function test_handle_reorders_shared_pages_when_no_organizer_is_given(): void
    {
        $this->repository->shouldReceive('findOwnedPages')
            ->once()
            ->with([2, 1], null)
            ->andReturn(new Collection([new ColouringPageDomainObject, new ColouringPageDomainObject]));
        $this->databaseManager->shouldReceive('transaction')->once()->andReturnUsing(fn (callable $callback) => $callback());
        $this->repository->shouldReceive('updateFromArray')->twice();

        $this->handler->handle(null, [2, 1]);

        $this->addToAssertionCount(1);
    }

    public function test_handle_throws_when_a_page_belongs_to_another_organizer(): void
    {
        $this->repository->shouldReceive('findOwnedPages')
            ->once()
            ->with([1, 2], 10)
            ->andReturn(new Collection([new ColouringPageDomainObject]));
        $this->databaseManager->shouldNotReceive('transaction');
        $this->repository->shouldNotReceive('updateFromArray');

        $this->expectException(ResourceNotFoundException::class);

        $this->handler->handle(10, [1, 2]);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
