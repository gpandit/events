<?php

namespace Tests\Unit\Services\Application\Handlers\ColouringPage;

use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use HiEvents\Services\Application\Handlers\ColouringPage\GetColouringPagesHandler;
use Illuminate\Support\Collection;
use Mockery as m;
use Tests\TestCase;

class GetColouringPagesHandlerTest extends TestCase
{
    public function test_handle_returns_every_page_for_the_dashboard(): void
    {
        $repository = m::mock(ColouringPageRepositoryInterface::class);
        $pages = new Collection;
        $repository->shouldReceive('findVisibleToOrganizer')->once()->with(10, null)->andReturn($pages);

        $this->assertSame($pages, (new GetColouringPagesHandler($repository))->handle(10));
    }

    public function test_handle_returns_only_published_pages_for_the_public_site(): void
    {
        $repository = m::mock(ColouringPageRepositoryInterface::class);
        $pages = new Collection;
        $repository->shouldReceive('findVisibleToOrganizer')->once()->with(10, 'PUBLISHED')->andReturn($pages);

        $this->assertSame($pages, (new GetColouringPagesHandler($repository))->handle(10, publishedOnly: true));
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
