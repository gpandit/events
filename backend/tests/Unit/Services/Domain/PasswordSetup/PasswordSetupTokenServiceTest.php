<?php

namespace Tests\Unit\Services\Domain\PasswordSetup;

use HiEvents\DomainObjects\Enums\PasswordSetupSubject;
use HiEvents\DomainObjects\PasswordSetupTokenDomainObject;
use HiEvents\Exceptions\InvalidPasswordSetupTokenException;
use HiEvents\Repository\Interfaces\PasswordSetupTokenRepositoryInterface;
use HiEvents\Services\Domain\PasswordSetup\PasswordSetupTokenService;
use Illuminate\Support\Carbon;
use Mockery as m;
use Tests\TestCase;

class PasswordSetupTokenServiceTest extends TestCase
{
    private PasswordSetupTokenRepositoryInterface $tokens;

    private PasswordSetupTokenService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tokens = m::mock(PasswordSetupTokenRepositoryInterface::class);
        $this->service = new PasswordSetupTokenService($this->tokens);
    }

    public function test_issue_stores_only_a_hash_of_the_token_and_replaces_older_tokens(): void
    {
        $this->tokens->shouldReceive('deleteWhere')->once()->with(['subject_type' => 'CUSTOMER', 'subject_id' => 7]);
        $this->tokens->shouldReceive('create')->once()->with(m::on(function (array $attributes) use (&$stored) {
            $stored = $attributes;

            return true;
        }));

        $token = $this->service->issue(PasswordSetupSubject::CUSTOMER, 7);

        $this->assertSame(48, strlen($token));
        $this->assertSame(hash('sha256', $token), $stored['token_hash']);
        $this->assertNotSame($token, $stored['token_hash']);
        $this->assertTrue(Carbon::parse($stored['expires_at'])->isFuture());
    }

    public function test_consume_returns_the_subject_and_burns_the_token(): void
    {
        $record = (new PasswordSetupTokenDomainObject)->setId(3)->setSubjectId(7)->setExpiresAt(Carbon::now()->addMinutes(5)->toDateTimeString());
        $this->tokens->shouldReceive('findFirstWhere')->once()->with(['subject_type' => 'CUSTOMER', 'token_hash' => hash('sha256', 'abc')])->andReturn($record);
        $this->tokens->shouldReceive('deleteById')->once()->with(3);

        $this->assertSame(7, $this->service->consume(PasswordSetupSubject::CUSTOMER, 'abc'));
    }

    public function test_consume_rejects_unknown_and_expired_tokens(): void
    {
        $expired = (new PasswordSetupTokenDomainObject)->setId(3)->setSubjectId(7)->setExpiresAt(Carbon::now()->subMinute()->toDateTimeString());
        $this->tokens->shouldReceive('findFirstWhere')->twice()->andReturn(null, $expired);
        $this->tokens->shouldNotReceive('deleteById');

        foreach (['unknown', 'expired'] as $token) {
            try {
                $this->service->consume(PasswordSetupSubject::QUIZ_PLAYER, $token);
                $this->fail('Expected the token to be rejected');
            } catch (InvalidPasswordSetupTokenException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
