<?php

namespace Tests\Unit\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\Enums\QuizAgeBand;
use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RegisterQuizPlayerDTO;
use HiEvents\Services\Application\Handlers\Quiz\RegisterQuizPlayerHandler;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use HiEvents\Services\Domain\Quiz\QuizUsernameGenerator;
use Illuminate\Contracts\Hashing\Hasher;
use Mockery as m;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RegisterQuizPlayerHandlerTest extends TestCase
{
    private QuizPlayerRepositoryInterface $players;

    private QuizUsernameGenerator $generator;

    private QuizPlayerSessionService $sessions;

    private Hasher $hasher;

    private RegisterQuizPlayerHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->players = m::mock(QuizPlayerRepositoryInterface::class);
        $this->generator = m::mock(QuizUsernameGenerator::class);
        $this->sessions = m::mock(QuizPlayerSessionService::class);
        $this->hasher = m::mock(Hasher::class);

        $this->handler = new RegisterQuizPlayerHandler(
            $this->players,
            $this->generator,
            $this->sessions,
            $this->hasher,
        );
    }

    #[DataProvider('ageBands')]
    public function test_it_creates_a_player_with_a_generated_username_for_every_age_band(QuizAgeBand $ageBand): void
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
                && $attributes['age_band'] === $ageBand->value
                && $attributes['password'] === 'hashed'))
            ->andReturn($created);

        $this->sessions->shouldReceive('issueToken')->once()->with($created)->andReturn('token-123');

        $session = $this->handler->handle(
            new RegisterQuizPlayerDTO(10, ' Amelia ', ' Amelia@Example.com ', $ageBand, 'secret1')
        );

        $this->assertSame('Simba42', $session->username);
        $this->assertSame('token-123', $session->token);
    }

    public static function ageBands(): array
    {
        return array_map(fn (QuizAgeBand $ageBand) => [$ageBand], QuizAgeBand::cases());
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
