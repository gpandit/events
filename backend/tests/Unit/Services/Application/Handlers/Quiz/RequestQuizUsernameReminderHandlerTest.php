<?php

namespace Tests\Unit\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Mail\Quiz\QuizUsernameReminderEmail;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RequestQuizUsernameReminderDTO;
use HiEvents\Services\Application\Handlers\Quiz\RequestQuizUsernameReminderHandler;
use Illuminate\Contracts\Mail\Mailer;
use Mockery as m;
use Tests\TestCase;

class RequestQuizUsernameReminderHandlerTest extends TestCase
{
    private QuizPlayerRepositoryInterface $players;

    private OrganizerRepositoryInterface $organizers;

    private Mailer $mailer;

    private RequestQuizUsernameReminderHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->players = m::mock(QuizPlayerRepositoryInterface::class);
        $this->organizers = m::mock(OrganizerRepositoryInterface::class);
        $this->mailer = m::mock(Mailer::class);

        $this->handler = new RequestQuizUsernameReminderHandler($this->players, $this->organizers, $this->mailer);
    }

    public function test_it_emails_the_username_saved_against_the_email(): void
    {
        $this->players->shouldReceive('findWhere')->once()->andReturn(collect([(new QuizPlayerDomainObject)->setUsername('Simba42')]));
        $this->organizers->shouldReceive('findById')->once()->with(10)->andReturn((new OrganizerDomainObject)->setName('Friends of Repton'));
        $this->mailer->shouldReceive('to')->once()->with('amelia@example.com')->andReturnSelf();
        $this->mailer->shouldReceive('queue')->once()->with(m::type(QuizUsernameReminderEmail::class));

        $this->handler->handle(new RequestQuizUsernameReminderDTO(10, ' Amelia@Example.com '));

        $this->addToAssertionCount(1);
    }

    public function test_it_sends_nothing_when_the_email_is_not_registered(): void
    {
        $this->players->shouldReceive('findWhere')->once()->andReturn(collect());
        $this->mailer->shouldNotReceive('to');

        $this->handler->handle(new RequestQuizUsernameReminderDTO(10, 'nobody@example.com'));

        $this->addToAssertionCount(1);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
