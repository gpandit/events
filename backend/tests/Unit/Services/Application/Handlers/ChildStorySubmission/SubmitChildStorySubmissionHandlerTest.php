<?php

namespace Tests\Unit\Services\Application\Handlers\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\DTO\SubmitChildStorySubmissionDTO;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\SubmitChildStorySubmissionHandler;
use HiEvents\Services\Infrastructure\HtmlPurifier\HtmlPurifierService;
use Mockery as m;
use Tests\TestCase;

class SubmitChildStorySubmissionHandlerTest extends TestCase
{
    private ChildStorySubmissionRepositoryInterface $repository;

    private HtmlPurifierService $purifier;

    private SubmitChildStorySubmissionHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = m::mock(ChildStorySubmissionRepositoryInterface::class);
        $this->purifier = m::mock(HtmlPurifierService::class);
        $this->handler = new SubmitChildStorySubmissionHandler($this->repository, $this->purifier);
    }

    public function test_handle_purifies_content_and_creates_a_pending_submission(): void
    {
        $dto = new SubmitChildStorySubmissionDTO(
            organizer_id: 10,
            type: 'STORY',
            first_name: 'Amelia',
            last_name: 'Khan',
            year_group: 'Year 4',
            content: '<script>alert(1)</script>Once upon a time...',
            original_filename: 'story.txt',
            consent_own_work: true,
            consent_publish: true,
        );

        $expectedSubmission = m::mock(ChildStorySubmissionDomainObject::class);

        $this->purifier
            ->shouldReceive('purify')
            ->once()
            ->with('<script>alert(1)</script>Once upon a time...')
            ->andReturn('Once upon a time...');

        $this->repository
            ->shouldReceive('create')
            ->once()
            ->with(m::on(function (array $attributes) {
                return $attributes['organizer_id'] === 10
                    && $attributes['type'] === 'STORY'
                    && $attributes['first_name'] === 'Amelia'
                    && $attributes['last_name'] === 'Khan'
                    && $attributes['year_group'] === 'Year 4'
                    && $attributes['content'] === 'Once upon a time...'
                    && $attributes['original_filename'] === 'story.txt'
                    && $attributes['consent_own_work'] === true
                    && $attributes['consent_publish'] === true
                    && $attributes['status'] === ChildStorySubmissionStatus::PENDING->value
                    && isset($attributes['submitted_at']);
            }))
            ->andReturn($expectedSubmission);

        $result = $this->handler->handle($dto);

        $this->assertSame($expectedSubmission, $result);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
