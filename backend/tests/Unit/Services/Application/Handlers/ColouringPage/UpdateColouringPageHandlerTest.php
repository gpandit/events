<?php

namespace Tests\Unit\Services\Application\Handlers\ColouringPage;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\DomainObjects\Enums\ColouringPageAgeGroup;
use HiEvents\DomainObjects\Enums\ColouringPageTint;
use HiEvents\DomainObjects\Status\ColouringPageStatus;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use HiEvents\Services\Application\Handlers\ColouringPage\DTO\UpdateColouringPageDTO;
use HiEvents\Services\Application\Handlers\ColouringPage\UpdateColouringPageHandler;
use Mockery as m;
use Tests\TestCase;

class UpdateColouringPageHandlerTest extends TestCase
{
    private ColouringPageRepositoryInterface $repository;

    private UpdateColouringPageHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = m::mock(ColouringPageRepositoryInterface::class);
        $this->handler = new UpdateColouringPageHandler($this->repository);
    }

    private function dto(): UpdateColouringPageDTO
    {
        return new UpdateColouringPageDTO(
            organizerId: 10,
            pageId: 5,
            title: '<i>Dhow</i> Boat ',
            ageGroup: ColouringPageAgeGroup::AGE_11_13,
            tint: ColouringPageTint::SKY,
            status: ColouringPageStatus::DRAFT,
        );
    }

    public function test_handle_updates_the_page_with_a_clean_title(): void
    {
        $updated = new ColouringPageDomainObject;

        $this->repository->shouldReceive('findFirstWhere')
            ->once()
            ->with(['id' => 5, 'organizer_id' => 10])
            ->andReturn(new ColouringPageDomainObject);
        $this->repository->shouldReceive('updateFromArray')
            ->once()
            ->with(5, [
                'title' => 'Dhow Boat',
                'age_group' => 'AGE_11_13',
                'tint' => 'SKY',
                'status' => 'DRAFT',
            ])
            ->andReturn($updated);

        $this->assertSame($updated, $this->handler->handle($this->dto()));
    }

    public function test_handle_throws_when_the_page_belongs_to_another_organizer(): void
    {
        $this->repository->shouldReceive('findFirstWhere')->once()->andReturn(null);
        $this->repository->shouldNotReceive('updateFromArray');

        $this->expectException(ResourceNotFoundException::class);

        $this->handler->handle($this->dto());
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
