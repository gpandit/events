<?php

namespace Tests\Unit\Services\Application\Handlers\ColouringPage;

use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use HiEvents\Services\Application\Handlers\ColouringPage\GetSharedColouringPagesHandler;
use Illuminate\Support\Collection;
use Mockery as m;
use Tests\TestCase;

class GetSharedColouringPagesHandlerTest extends TestCase
{
    public function test_handle_returns_only_pages_without_an_organizer(): void
    {
        $pages = new Collection;
        $repository = m::mock(ColouringPageRepositoryInterface::class);
        $repository->shouldReceive('findOwnedBy')->once()->with(null)->andReturn($pages);

        $this->assertSame($pages, (new GetSharedColouringPagesHandler($repository))->handle());
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
