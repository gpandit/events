<?php

namespace Tests\Unit\Services\Application\Handlers\Quiz;

use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Exceptions\InvalidQuizPlayerCredentialsException;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Quiz\DTO\LoginQuizPlayerDTO;
use HiEvents\Services\Application\Handlers\Quiz\LoginQuizPlayerHandler;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use Illuminate\Contracts\Hashing\Hasher;
use Mockery as m;
use Tests\TestCase;

class LoginQuizPlayerHandlerTest extends TestCase
{
    private QuizPlayerRepositoryInterface $players;

    private QuizPlayerSessionService $sessions;

    private Hasher $hasher;

    private LoginQuizPlayerHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->players = m::mock(QuizPlayerRepositoryInterface::class);
        $this->sessions = m::mock(QuizPlayerSessionService::class);
        $this->hasher = m::mock(Hasher::class);
        $this->handler = new LoginQuizPlayerHandler($this->players, $this->sessions, $this->hasher);
    }

    public function test_it_signs_in_with_the_correct_password(): void
    {
        $player = (new QuizPlayerDomainObject)->setId(1)->setUsername('Simba42')->setPassword('hashed');
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn($player);
        $this->hasher->shouldReceive('check')->once()->with('secret1', 'hashed')->andReturn(true);
        $this->sessions->shouldReceive('issueToken')->once()->with($player)->andReturn('token-123');

        $session = $this->handler->handle(new LoginQuizPlayerDTO(10, ' simba42 ', 'secret1'));

        $this->assertSame('Simba42', $session->username);
        $this->assertSame('token-123', $session->token);
    }

    public function test_it_rejects_a_wrong_password(): void
    {
        $player = (new QuizPlayerDomainObject)->setId(1)->setUsername('Simba42')->setPassword('hashed');
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn($player);
        $this->hasher->shouldReceive('check')->once()->andReturn(false);

        $this->expectException(InvalidQuizPlayerCredentialsException::class);

        $this->handler->handle(new LoginQuizPlayerDTO(10, 'Simba42', 'wrong'));
    }

    public function test_it_rejects_an_unknown_username(): void
    {
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn(null);

        $this->expectException(InvalidQuizPlayerCredentialsException::class);

        $this->handler->handle(new LoginQuizPlayerDTO(10, 'Nobody1', 'secret1'));
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
