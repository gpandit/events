<?php

namespace Tests\Unit\Services\Application\Handlers\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\ReviewChildStorySubmissionHandler;
use Mockery as m;
use Tests\TestCase;

class ReviewChildStorySubmissionHandlerTest extends TestCase
{
    private ChildStorySubmissionRepositoryInterface $repository;

    private ReviewChildStorySubmissionHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = m::mock(ChildStorySubmissionRepositoryInterface::class);
        $this->handler = new ReviewChildStorySubmissionHandler($this->repository);
    }

    public function test_handle_approves_a_submission_and_sets_published_at(): void
    {
        $existing = m::mock(ChildStorySubmissionDomainObject::class);
        $updated = m::mock(ChildStorySubmissionDomainObject::class);

        $this->repository
            ->shouldReceive('findFirstWhere')
            ->once()
            ->with(['id' => 5, 'organizer_id' => 10])
            ->andReturn($existing);

        $this->repository
            ->shouldReceive('updateFromArray')
            ->once()
            ->with(5, m::on(function (array $attributes) {
                return $attributes['status'] === ChildStorySubmissionStatus::APPROVED->value
                    && isset($attributes['reviewed_at'])
                    && isset($attributes['published_at']);
            }))
            ->andReturn($updated);

        $result = $this->handler->handle(5, 10, ChildStorySubmissionStatus::APPROVED);

        $this->assertSame($updated, $result);
    }

    public function test_handle_rejects_a_submission_without_setting_published_at(): void
    {
        $existing = m::mock(ChildStorySubmissionDomainObject::class);
        $updated = m::mock(ChildStorySubmissionDomainObject::class);

        $this->repository
            ->shouldReceive('findFirstWhere')
            ->once()
            ->with(['id' => 5, 'organizer_id' => 10])
            ->andReturn($existing);

        $this->repository
            ->shouldReceive('updateFromArray')
            ->once()
            ->with(5, m::on(function (array $attributes) {
                return $attributes['status'] === ChildStorySubmissionStatus::REJECTED->value
                    && $attributes['published_at'] === null;
            }))
            ->andReturn($updated);

        $result = $this->handler->handle(5, 10, ChildStorySubmissionStatus::REJECTED);

        $this->assertSame($updated, $result);
    }

    public function test_handle_throws_when_submission_does_not_belong_to_organizer(): void
    {
        $this->repository
            ->shouldReceive('findFirstWhere')
            ->once()
            ->with(['id' => 5, 'organizer_id' => 10])
            ->andReturn(null);

        $this->repository->shouldNotReceive('updateFromArray');

        $this->expectException(ResourceNotFoundException::class);

        $this->handler->handle(5, 10, ChildStorySubmissionStatus::APPROVED);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
