<?php

namespace Tests\Unit\Services\Application\Handlers\ColouringPage;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\DomainObjects\Enums\ColouringPageAgeGroup;
use HiEvents\DomainObjects\Enums\ColouringPageTint;
use HiEvents\DomainObjects\Status\ColouringPageStatus;
use HiEvents\Exceptions\CouldNotStoreColouringPageFilesException;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use HiEvents\Services\Application\Handlers\ColouringPage\CreateColouringPageHandler;
use HiEvents\Services\Application\Handlers\ColouringPage\DTO\CreateColouringPageDTO;
use HiEvents\Services\Infrastructure\ColouringPage\ColouringPageFileStorageService;
use HiEvents\Services\Infrastructure\ColouringPage\DTO\ColouringPageFilesDTO;
use Illuminate\Http\UploadedFile;
use Mockery as m;
use RuntimeException;
use Tests\TestCase;

class CreateColouringPageHandlerTest extends TestCase
{
    private ColouringPageRepositoryInterface $repository;

    private ColouringPageFileStorageService $fileStorage;

    private CreateColouringPageHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = m::mock(ColouringPageRepositoryInterface::class);
        $this->fileStorage = m::mock(ColouringPageFileStorageService::class);
        $this->handler = new CreateColouringPageHandler($this->repository, $this->fileStorage);
    }

    private function dto(string $title = '  <b>Kawaii</b> Cat  '): CreateColouringPageDTO
    {
        return new CreateColouringPageDTO(
            organizerId: 10,
            title: $title,
            ageGroup: ColouringPageAgeGroup::AGE_6_10,
            tint: ColouringPageTint::PEACH,
            status: ColouringPageStatus::PUBLISHED,
            pdf: m::mock(UploadedFile::class),
            thumbnail: m::mock(UploadedFile::class),
        );
    }

    public function test_handle_stores_files_and_creates_a_page_with_a_clean_title_at_the_end_of_the_list(): void
    {
        $dto = $this->dto();
        $created = new ColouringPageDomainObject;

        $this->fileStorage->shouldReceive('store')
            ->once()
            ->with($dto->pdf, $dto->thumbnail, 'Kawaii Cat')
            ->andReturn(new ColouringPageFilesDTO('colouring-pages/a.pdf', 'colouring-pages/a.png'));

        $this->repository->shouldReceive('findNextSortOrder')->once()->with(10)->andReturn(7);
        $this->repository->shouldReceive('create')
            ->once()
            ->with([
                'organizer_id' => 10,
                'title' => 'Kawaii Cat',
                'age_group' => 'AGE_6_10',
                'tint' => 'PEACH',
                'status' => 'PUBLISHED',
                'pdf_path' => 'colouring-pages/a.pdf',
                'thumbnail_path' => 'colouring-pages/a.png',
                'sort_order' => 7,
            ])
            ->andReturn($created);

        $this->assertSame($created, $this->handler->handle($dto));
    }

    public function test_handle_removes_the_stored_files_when_the_page_cannot_be_saved(): void
    {
        $this->fileStorage->shouldReceive('store')
            ->once()
            ->andReturn(new ColouringPageFilesDTO('colouring-pages/a.pdf', 'colouring-pages/a.png'));
        $this->repository->shouldReceive('findNextSortOrder')->once()->andReturn(0);
        $this->repository->shouldReceive('create')->once()->andThrow(new RuntimeException('database down'));
        $this->fileStorage->shouldReceive('delete')->once()->with('colouring-pages/a.pdf', 'colouring-pages/a.png');

        $this->expectException(RuntimeException::class);

        $this->handler->handle($this->dto());
    }

    public function test_handle_does_not_create_a_page_when_the_files_cannot_be_stored(): void
    {
        $this->fileStorage->shouldReceive('store')->once()->andThrow(new CouldNotStoreColouringPageFilesException('nope'));
        $this->repository->shouldNotReceive('create');

        $this->expectException(CouldNotStoreColouringPageFilesException::class);

        $this->handler->handle($this->dto());
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
