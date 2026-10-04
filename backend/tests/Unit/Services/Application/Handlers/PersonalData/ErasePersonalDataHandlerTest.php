<?php

namespace Tests\Unit\Services\Application\Handlers\PersonalData;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\DomainObjects\DataErasureRequestDomainObject;
use HiEvents\DomainObjects\TicketLookupTokenDomainObject;
use HiEvents\Exceptions\InvalidCredentialsException;
use HiEvents\Exceptions\InvalidTicketLookupTokenException;
use HiEvents\Repository\Interfaces\CustomerRepositoryInterface;
use HiEvents\Services\Application\Handlers\PersonalData\ErasePersonalDataHandler;
use HiEvents\Services\Domain\PersonalData\PersonalDataErasureService;
use HiEvents\Services\Domain\TicketLookup\TicketLookupTokenService;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Support\Collection;
use Mockery as m;
use Tests\TestCase;

class ErasePersonalDataHandlerTest extends TestCase
{
    private TicketLookupTokenService $tokens;

    private CustomerRepositoryInterface $customers;

    private PersonalDataErasureService $erasure;

    private Hasher $hasher;

    private ErasePersonalDataHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tokens = m::mock(TicketLookupTokenService::class);
        $this->customers = m::mock(CustomerRepositoryInterface::class);
        $this->erasure = m::mock(PersonalDataErasureService::class);
        $this->hasher = m::mock(Hasher::class);
        $this->handler = new ErasePersonalDataHandler($this->tokens, $this->customers, $this->erasure, $this->hasher);

        $this->tokens->shouldReceive('findValid')->with('tl_abc')->andReturn(
            (new TicketLookupTokenDomainObject)->setEmail('Parent@Example.com')
        );
    }

    private function customerWithPassword(?string $hash): Collection
    {
        return collect([(new CustomerDomainObject)->setPassword($hash)]);
    }

    public function test_it_erases_without_a_password_when_the_account_has_none(): void
    {
        $this->customers->shouldReceive('findWhere')->once()->andReturn($this->customerWithPassword(null));
        $erased = new DataErasureRequestDomainObject;
        $this->erasure->shouldReceive('erase')->once()->with('parent@example.com')->andReturn($erased);

        $this->assertSame($erased, $this->handler->handle('tl_abc', null));
    }

    public function test_it_requires_the_correct_password_when_the_account_has_one(): void
    {
        $this->customers->shouldReceive('findWhere')->andReturn($this->customerWithPassword('hashed'));
        $this->erasure->shouldNotReceive('erase');

        $this->hasher->shouldReceive('check')->with('wrong', 'hashed')->andReturn(false);

        $this->expectException(InvalidCredentialsException::class);

        $this->handler->handle('tl_abc', 'wrong');
    }

    public function test_it_rejects_a_missing_password_when_the_account_has_one(): void
    {
        $this->customers->shouldReceive('findWhere')->andReturn($this->customerWithPassword('hashed'));
        $this->erasure->shouldNotReceive('erase');

        $this->expectException(InvalidCredentialsException::class);

        $this->handler->handle('tl_abc', null);
    }

    public function test_it_erases_when_the_password_matches(): void
    {
        $this->customers->shouldReceive('findWhere')->andReturn($this->customerWithPassword('hashed'));
        $this->hasher->shouldReceive('check')->with('secret123', 'hashed')->andReturn(true);
        $erased = new DataErasureRequestDomainObject;
        $this->erasure->shouldReceive('erase')->once()->with('parent@example.com')->andReturn($erased);

        $this->assertSame($erased, $this->handler->handle('tl_abc', 'secret123'));
    }

    public function test_an_invalid_token_stops_everything(): void
    {
        $tokens = m::mock(TicketLookupTokenService::class);
        $tokens->shouldReceive('findValid')->andThrow(new InvalidTicketLookupTokenException('expired'));
        $this->erasure->shouldNotReceive('erase');

        $this->expectException(InvalidTicketLookupTokenException::class);

        (new ErasePersonalDataHandler($tokens, $this->customers, $this->erasure, $this->hasher))->handle('bad', null);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
