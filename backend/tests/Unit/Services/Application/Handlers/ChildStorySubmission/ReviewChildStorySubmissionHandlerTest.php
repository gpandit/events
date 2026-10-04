<?php

namespace Tests\Unit\Services\Application\Handlers\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\ParentalConsentDomainObject;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use HiEvents\Exceptions\ChildStoryPublicationNotPermittedException;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\ReviewChildStorySubmissionHandler;
use HiEvents\Services\Domain\ParentalConsent\ParentalConsentService;
use Mockery as m;
use Tests\TestCase;

class ReviewChildStorySubmissionHandlerTest extends TestCase
{
    private ChildStorySubmissionRepositoryInterface $repository;

    private ParentalConsentService $parentalConsent;

    private ReviewChildStorySubmissionHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = m::mock(ChildStorySubmissionRepositoryInterface::class);
        $this->parentalConsent = m::mock(ParentalConsentService::class);
        $this->handler = new ReviewChildStorySubmissionHandler($this->repository, $this->parentalConsent);
    }

    private function publishableSubmission(bool $consentPublish = true): ChildStorySubmissionDomainObject
    {
        return (new ChildStorySubmissionDomainObject)->setId(5)->setConsentPublish($consentPublish);
    }

    private function consent(string $status): ParentalConsentDomainObject
    {
        return (new ParentalConsentDomainObject)
            ->setStatus($status)
            ->setExpiresAt(now()->addDay()->toDateTimeString());
    }

    public function test_handle_approves_a_submission_and_sets_published_at(): void
    {
        $existing = $this->publishableSubmission();
        $updated = m::mock(ChildStorySubmissionDomainObject::class);

        $this->parentalConsent->shouldReceive('findForSubject')
            ->once()
            ->with(ParentalConsentSubject::CHILD_STORY, 5)
            ->andReturn(null);

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

    public function test_handle_approves_when_the_parent_has_granted_consent(): void
    {
        $this->repository->shouldReceive('findFirstWhere')->once()->andReturn($this->publishableSubmission());
        $this->parentalConsent->shouldReceive('findForSubject')->once()->andReturn($this->consent('GRANTED'));
        $updated = m::mock(ChildStorySubmissionDomainObject::class);
        $this->repository->shouldReceive('updateFromArray')->once()->andReturn($updated);

        $this->assertSame($updated, $this->handler->handle(5, 10, ChildStorySubmissionStatus::APPROVED));
    }

    public function test_handle_refuses_to_approve_while_parental_consent_is_pending_or_declined(): void
    {
        foreach (['PENDING', 'DECLINED'] as $status) {
            $repository = m::mock(ChildStorySubmissionRepositoryInterface::class);
            $parentalConsent = m::mock(ParentalConsentService::class);
            $repository->shouldReceive('findFirstWhere')->once()->andReturn($this->publishableSubmission());
            $repository->shouldNotReceive('updateFromArray');
            $parentalConsent->shouldReceive('findForSubject')->once()->andReturn($this->consent($status));

            try {
                (new ReviewChildStorySubmissionHandler($repository, $parentalConsent))
                    ->handle(5, 10, ChildStorySubmissionStatus::APPROVED);
                $this->fail("Approval should be refused when consent is {$status}");
            } catch (ChildStoryPublicationNotPermittedException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function test_handle_refuses_to_approve_work_the_author_did_not_agree_to_publish(): void
    {
        $this->repository->shouldReceive('findFirstWhere')->once()->andReturn($this->publishableSubmission(false));
        $this->repository->shouldNotReceive('updateFromArray');

        $this->expectException(ChildStoryPublicationNotPermittedException::class);

        $this->handler->handle(5, 10, ChildStorySubmissionStatus::APPROVED);
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
