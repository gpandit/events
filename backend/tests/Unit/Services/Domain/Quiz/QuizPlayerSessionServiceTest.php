<?php

namespace Tests\Unit\Services\Domain\Quiz;

use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Exceptions\InvalidQuizPlayerTokenException;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use Illuminate\Encryption\Encrypter;
use Illuminate\Support\Carbon;
use Mockery as m;
use Tests\TestCase;

class QuizPlayerSessionServiceTest extends TestCase
{
    private Encrypter $encrypter;

    private QuizPlayerRepositoryInterface $players;

    private QuizPlayerSessionService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->encrypter = new Encrypter(str_repeat('k', 32), 'AES-256-CBC');
        $this->players = m::mock(QuizPlayerRepositoryInterface::class);
        $this->service = new QuizPlayerSessionService($this->encrypter, $this->players);
    }

    private function player(): QuizPlayerDomainObject
    {
        return (new QuizPlayerDomainObject)->setId(5)->setOrganizerId(10)->setUsername('Simba42');
    }

    public function test_a_issued_token_authenticates_the_player(): void
    {
        $player = $this->player();
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn($player);

        $token = $this->service->issueToken($player);

        $this->assertSame($player, $this->service->authenticate($token, 10));
    }

    public function test_it_rejects_a_missing_token(): void
    {
        $this->expectException(InvalidQuizPlayerTokenException::class);

        $this->service->authenticate(null, 10);
    }

    public function test_it_rejects_a_tampered_token(): void
    {
        $this->expectException(InvalidQuizPlayerTokenException::class);

        $this->service->authenticate('not-a-real-token', 10);
    }

    public function test_it_rejects_a_token_issued_for_another_organizer(): void
    {
        $token = $this->service->issueToken($this->player());

        $this->expectException(InvalidQuizPlayerTokenException::class);

        $this->service->authenticate($token, 11);
    }

    public function test_it_rejects_an_expired_token(): void
    {
        $token = $this->service->issueToken($this->player());

        Carbon::setTestNow(Carbon::now()->addDays(91));

        try {
            $this->expectException(InvalidQuizPlayerTokenException::class);
            $this->service->authenticate($token, 10);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_it_rejects_a_token_for_a_player_that_no_longer_exists(): void
    {
        $token = $this->service->issueToken($this->player());
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn(null);

        $this->expectException(InvalidQuizPlayerTokenException::class);

        $this->service->authenticate($token, 10);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
