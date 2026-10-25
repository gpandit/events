<?php

namespace Tests\Unit\Services\Application\Handlers\ColouringPage;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use HiEvents\Services\Application\Handlers\ColouringPage\DeleteColouringPageHandler;
use HiEvents\Services\Infrastructure\ColouringPage\ColouringPageFileStorageService;
use Mockery as m;
use Tests\TestCase;

class DeleteColouringPageHandlerTest extends TestCase
{
    private ColouringPageRepositoryInterface $repository;

    private ColouringPageFileStorageService $fileStorage;

    private DeleteColouringPageHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = m::mock(ColouringPageRepositoryInterface::class);
        $this->fileStorage = m::mock(ColouringPageFileStorageService::class);
        $this->handler = new DeleteColouringPageHandler($this->repository, $this->fileStorage);
    }

    private function page(string $pdfPath, string $thumbnailPath): ColouringPageDomainObject
    {
        return (new ColouringPageDomainObject)->setPdfPath($pdfPath)->setThumbnailPath($thumbnailPath);
    }

    public function test_handle_deletes_the_page_and_its_uploaded_files(): void
    {
        $this->repository->shouldReceive('findOwnedPage')
            ->once()
            ->with(5, 10)
            ->andReturn($this->page('colouring-pages/a.pdf', 'colouring-pages/a.png'));
        $this->repository->shouldReceive('deleteById')->once()->with(5);
        $this->fileStorage->shouldReceive('delete')->once()->with('colouring-pages/a.pdf', 'colouring-pages/a.png');

        $this->handler->handle(5, 10);

        $this->addToAssertionCount(1);
    }

    public function test_handle_deletes_a_shared_page_when_no_organizer_is_given(): void
    {
        $this->repository->shouldReceive('findOwnedPage')
            ->once()
            ->with(5, null)
            ->andReturn($this->page('colouring-pages/a.pdf', 'colouring-pages/a.png'));
        $this->repository->shouldReceive('deleteById')->once()->with(5);
        $this->fileStorage->shouldReceive('delete')->once();

        $this->handler->handle(5, null);

        $this->addToAssertionCount(1);
    }

    public function test_handle_leaves_bundled_assets_in_place(): void
    {
        $this->repository->shouldReceive('findOwnedPage')
            ->once()
            ->andReturn($this->page('/pdf/kawaii-cat-coloring-page.pdf', '/pdf-thumbnails/kawaii-cat-coloring-page.png'));
        $this->repository->shouldReceive('deleteById')->once()->with(5);
        $this->fileStorage->shouldNotReceive('delete');

        $this->handler->handle(5, 10);

        $this->addToAssertionCount(1);
    }

    public function test_handle_throws_when_the_page_belongs_to_another_organizer(): void
    {
        $this->repository->shouldReceive('findOwnedPage')
            ->once()
            ->with(5, 10)
            ->andReturn(null);
        $this->repository->shouldNotReceive('deleteById');
        $this->fileStorage->shouldNotReceive('delete');

        $this->expectException(ResourceNotFoundException::class);

        $this->handler->handle(5, 10);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
