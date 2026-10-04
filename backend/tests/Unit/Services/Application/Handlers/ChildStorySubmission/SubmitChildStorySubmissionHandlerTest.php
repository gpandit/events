<?php

namespace Tests\Unit\Services\Application\Handlers\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use HiEvents\Mail\ChildStory\ChildStoryParentConsentEmail;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\DTO\SubmitChildStorySubmissionDTO;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\SubmitChildStorySubmissionHandler;
use HiEvents\Services\Domain\ParentalConsent\ParentalConsentService;
use HiEvents\Services\Infrastructure\HtmlPurifier\HtmlPurifierService;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Mail\PendingMail;
use Mockery as m;
use Tests\TestCase;

class SubmitChildStorySubmissionHandlerTest extends TestCase
{
    private ChildStorySubmissionRepositoryInterface $repository;

    private HtmlPurifierService $purifier;

    private OrganizerRepositoryInterface $organizers;

    private ParentalConsentService $parentalConsent;

    private Mailer $mailer;

    private SubmitChildStorySubmissionHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = m::mock(ChildStorySubmissionRepositoryInterface::class);
        $this->purifier = m::mock(HtmlPurifierService::class);
        $this->organizers = m::mock(OrganizerRepositoryInterface::class);
        $this->parentalConsent = m::mock(ParentalConsentService::class);
        $this->mailer = m::mock(Mailer::class);
        $this->handler = new SubmitChildStorySubmissionHandler(
            $this->repository,
            $this->purifier,
            $this->organizers,
            $this->parentalConsent,
            $this->mailer,
        );
    }

    private function dto(?string $parentEmail = null): SubmitChildStorySubmissionDTO
    {
        return new SubmitChildStorySubmissionDTO(
            organizer_id: 10,
            type: 'STORY',
            first_name: 'Amelia',
            last_name: 'Khan',
            year_group: 'Year 4',
            content: '<script>alert(1)</script>Once upon a time...',
            original_filename: 'story.txt',
            consent_own_work: true,
            consent_publish: true,
            parent_email: $parentEmail,
        );
    }

    public function test_handle_purifies_content_and_creates_a_pending_submission(): void
    {
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

        $this->parentalConsent->shouldNotReceive('request');
        $this->mailer->shouldNotReceive('to');

        $result = $this->handler->handle($this->dto());

        $this->assertSame($expectedSubmission, $result);
    }

    public function test_handle_requests_parental_consent_and_emails_the_parent_when_a_parent_email_is_given(): void
    {
        $submission = (new ChildStorySubmissionDomainObject)
            ->setId(3)
            ->setOrganizerId(10)
            ->setType('STORY')
            ->setFirstName('Amelia')
            ->setLastName('Khan')
            ->setYearGroup('Year 4');

        $this->purifier->shouldReceive('purify')->once()->andReturn('Once upon a time...');
        $this->repository->shouldReceive('create')->once()->andReturn($submission);

        $organizer = m::mock(OrganizerDomainObject::class);
        $organizer->shouldReceive('getId')->andReturn(10);
        $organizer->shouldReceive('getSlug')->andReturn('friends');
        $organizer->shouldReceive('getName')->andReturn('Friends of Repton');
        $this->organizers->shouldReceive('findById')->once()->with(10)->andReturn($organizer);

        $this->parentalConsent->shouldReceive('request')
            ->once()
            ->with(10, ParentalConsentSubject::CHILD_STORY, 3, 'parent@example.com')
            ->andReturn('consent-token');

        $pendingMail = m::mock(PendingMail::class);
        $pendingMail->shouldReceive('queue')->once()->with(m::type(ChildStoryParentConsentEmail::class));
        $this->mailer->shouldReceive('to')->once()->with('parent@example.com')->andReturn($pendingMail);

        $this->handler->handle($this->dto('parent@example.com'));
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
