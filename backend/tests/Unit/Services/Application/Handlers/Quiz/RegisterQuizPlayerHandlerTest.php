<?php

namespace Tests\Unit\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RegisterQuizPlayerDTO;
use HiEvents\Services\Application\Handlers\Quiz\RegisterQuizPlayerHandler;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use HiEvents\Services\Domain\Quiz\QuizUsernameGenerator;
use Illuminate\Contracts\Hashing\Hasher;
use Mockery as m;
use Tests\TestCase;

class RegisterQuizPlayerHandlerTest extends TestCase
{
    public function test_it_creates_a_player_with_a_generated_username_and_hashed_password(): void
    {
        $players = m::mock(QuizPlayerRepositoryInterface::class);
        $generator = m::mock(QuizUsernameGenerator::class);
        $sessions = m::mock(QuizPlayerSessionService::class);
        $hasher = m::mock(Hasher::class);

        $generator->shouldReceive('generate')->once()->with(10)->andReturn('Simba42');
        $hasher->shouldReceive('make')->once()->with('secret1')->andReturn('hashed');

        $created = (new QuizPlayerDomainObject)->setId(1)->setOrganizerId(10)->setUsername('Simba42');

        $players->shouldReceive('create')
            ->once()
            ->with(m::on(fn (array $attributes) => $attributes['organizer_id'] === 10
                && $attributes['username'] === 'Simba42'
                && $attributes['first_name'] === 'Amelia'
                && $attributes['last_name'] === 'Khan'
                && $attributes['email'] === 'amelia@example.com'
                && $attributes['password'] === 'hashed'))
            ->andReturn($created);

        $sessions->shouldReceive('issueToken')->once()->with($created)->andReturn('token-123');

        $session = (new RegisterQuizPlayerHandler($players, $generator, $sessions, $hasher))->handle(
            new RegisterQuizPlayerDTO(10, ' Amelia ', 'Khan ', ' Amelia@Example.com ', 'secret1')
        );

        $this->assertSame('Simba42', $session->username);
        $this->assertSame('token-123', $session->token);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
