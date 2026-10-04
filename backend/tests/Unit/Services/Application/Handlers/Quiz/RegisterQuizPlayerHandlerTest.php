<?php

namespace Tests\Unit\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\Enums\QuizAgeBand;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Mail\Quiz\QuizParentConsentEmail;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RegisterQuizPlayerDTO;
use HiEvents\Services\Application\Handlers\Quiz\RegisterQuizPlayerHandler;
use HiEvents\Services\Domain\ParentalConsent\ParentalConsentService;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use HiEvents\Services\Domain\Quiz\QuizUsernameGenerator;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Mail\PendingMail;
use Mockery as m;
use Tests\TestCase;

class RegisterQuizPlayerHandlerTest extends TestCase
{
    private QuizPlayerRepositoryInterface $players;

    private OrganizerRepositoryInterface $organizers;

    private QuizUsernameGenerator $generator;

    private QuizPlayerSessionService $sessions;

    private ParentalConsentService $parentalConsent;

    private Hasher $hasher;

    private Mailer $mailer;

    private RegisterQuizPlayerHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->players = m::mock(QuizPlayerRepositoryInterface::class);
        $this->organizers = m::mock(OrganizerRepositoryInterface::class);
        $this->generator = m::mock(QuizUsernameGenerator::class);
        $this->sessions = m::mock(QuizPlayerSessionService::class);
        $this->parentalConsent = m::mock(ParentalConsentService::class);
        $this->hasher = m::mock(Hasher::class);
        $this->mailer = m::mock(Mailer::class);

        $this->handler = new RegisterQuizPlayerHandler(
            $this->players,
            $this->organizers,
            $this->generator,
            $this->sessions,
            $this->parentalConsent,
            $this->hasher,
            $this->mailer,
        );
    }

    public function test_it_creates_a_player_without_requesting_consent_for_older_players(): void
    {
        $this->generator->shouldReceive('generate')->once()->with(10)->andReturn('Simba42');
        $this->hasher->shouldReceive('make')->once()->with('secret1')->andReturn('hashed');

        $created = (new QuizPlayerDomainObject)->setId(1)->setOrganizerId(10)->setUsername('Simba42');

        $this->players->shouldReceive('create')
            ->once()
            ->with(m::on(fn (array $attributes) => $attributes['organizer_id'] === 10
                && $attributes['username'] === 'Simba42'
                && $attributes['first_name'] === 'Amelia'
                && ! array_key_exists('last_name', $attributes)
                && $attributes['email'] === 'amelia@example.com'
                && $attributes['age_band'] === '14-17'
                && $attributes['password'] === 'hashed'))
            ->andReturn($created);

        $this->sessions->shouldReceive('issueToken')->once()->with($created)->andReturn('token-123');
        $this->parentalConsent->shouldNotReceive('request');
        $this->mailer->shouldNotReceive('to');

        $session = $this->handler->handle(
            new RegisterQuizPlayerDTO(10, ' Amelia ', ' Amelia@Example.com ', QuizAgeBand::AGES_14_TO_17, 'secret1')
        );

        $this->assertSame('Simba42', $session->username);
        $this->assertSame('token-123', $session->token);
    }

    public function test_it_requests_parental_consent_for_players_aged_13_and_under(): void
    {
        $this->generator->shouldReceive('generate')->once()->andReturn('Simba42');
        $this->hasher->shouldReceive('make')->once()->andReturn('hashed');

        $created = (new QuizPlayerDomainObject)
            ->setId(7)
            ->setOrganizerId(10)
            ->setUsername('Simba42')
            ->setFirstName('Amelia')
            ->setAgeBand('8-10');

        $this->players->shouldReceive('create')
            ->once()
            ->with(m::on(fn (array $attributes) => $attributes['age_band'] === '8-10'))
            ->andReturn($created);

        $organizer = m::mock(OrganizerDomainObject::class);
        $organizer->shouldReceive('getId')->andReturn(10);
        $organizer->shouldReceive('getSlug')->andReturn('friends');
        $organizer->shouldReceive('getName')->andReturn('Friends of Repton');
        $this->organizers->shouldReceive('findById')->once()->with(10)->andReturn($organizer);

        $this->parentalConsent->shouldReceive('request')
            ->once()
            ->with(10, ParentalConsentSubject::QUIZ_PLAYER, 7, 'parent@example.com')
            ->andReturn('consent-token');

        $pendingMail = m::mock(PendingMail::class);
        $pendingMail->shouldReceive('queue')
            ->once()
            ->with(m::type(QuizParentConsentEmail::class));
        $this->mailer->shouldReceive('to')->once()->with('parent@example.com')->andReturn($pendingMail);

        $this->sessions->shouldReceive('issueToken')->once()->andReturn('token-123');

        $this->handler->handle(
            new RegisterQuizPlayerDTO(10, 'Amelia', 'child@example.com', QuizAgeBand::AGES_8_TO_10, 'secret1', 'parent@example.com')
        );
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
