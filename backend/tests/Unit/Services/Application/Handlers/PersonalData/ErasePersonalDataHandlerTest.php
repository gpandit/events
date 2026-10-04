<?php

namespace Tests\Unit\Services\Application\Handlers\PersonalData;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\DomainObjects\TicketLookupTokenDomainObject;
use HiEvents\Exceptions\InvalidCredentialsException;
use HiEvents\Exceptions\InvalidTicketLookupTokenException;
use HiEvents\Repository\Interfaces\CustomerRepositoryInterface;
use HiEvents\Mail\PersonalData\PersonalDataErasedEmail;
use HiEvents\Services\Application\Handlers\PersonalData\ErasePersonalDataHandler;
use HiEvents\Services\Domain\PersonalData\DTO\PersonalDataErasureReportDTO;
use HiEvents\Services\Domain\PersonalData\PersonalDataErasureService;
use HiEvents\Services\Domain\TicketLookup\TicketLookupTokenService;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Mail\PendingMail;
use Illuminate\Support\Collection;
use Mockery as m;
use Psr\Log\LoggerInterface;
use Tests\TestCase;

class ErasePersonalDataHandlerTest extends TestCase
{
    private TicketLookupTokenService $tokens;

    private CustomerRepositoryInterface $customers;

    private PersonalDataErasureService $erasure;

    private Hasher $hasher;

    private Mailer $mailer;

    private LoggerInterface $logger;

    private ErasePersonalDataHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tokens = m::mock(TicketLookupTokenService::class);
        $this->customers = m::mock(CustomerRepositoryInterface::class);
        $this->erasure = m::mock(PersonalDataErasureService::class);
        $this->hasher = m::mock(Hasher::class);
        $this->mailer = m::mock(Mailer::class);
        $this->logger = m::mock(LoggerInterface::class);
        $this->handler = new ErasePersonalDataHandler($this->tokens, $this->customers, $this->erasure, $this->hasher, $this->mailer, $this->logger);

        $this->tokens->shouldReceive('findValid')->with('tl_abc')->andReturn(
            (new TicketLookupTokenDomainObject)->setEmail('Parent@Example.com')
        );
    }

    private function report(): PersonalDataErasureReportDTO
    {
        return new PersonalDataErasureReportDTO(['A1B2'], 1, 1, 0, 0, 0, 0, '2026-10-05 10:00:00');
    }

    private function expectConfirmationEmailTo(string $address): void
    {
        $pending = m::mock(PendingMail::class);
        $pending->shouldReceive('sendNow')->once()->with(m::type(PersonalDataErasedEmail::class));
        $this->mailer->shouldReceive('to')->once()->with($address)->andReturn($pending);
    }

    private function customerWithPassword(?string $hash): Collection
    {
        return collect([(new CustomerDomainObject)->setPassword($hash)]);
    }

    public function test_it_erases_without_a_password_when_the_account_has_none(): void
    {
        $this->customers->shouldReceive('findWhere')->once()->andReturn($this->customerWithPassword(null));
        $report = $this->report();
        $this->erasure->shouldReceive('erase')->once()->with('parent@example.com')->andReturn($report);
        $this->expectConfirmationEmailTo('parent@example.com');

        $this->assertSame($report, $this->handler->handle('tl_abc', null));
    }

    public function test_a_failure_to_send_the_confirmation_does_not_fail_the_erasure_or_log_the_address(): void
    {
        $this->customers->shouldReceive('findWhere')->once()->andReturn($this->customerWithPassword(null));
        $report = $this->report();
        $this->erasure->shouldReceive('erase')->once()->andReturn($report);

        $pending = m::mock(PendingMail::class);
        $pending->shouldReceive('sendNow')->once()->andThrow(new \RuntimeException('smtp down for parent@example.com'));
        $this->mailer->shouldReceive('to')->once()->andReturn($pending);
        $this->logger->shouldReceive('error')
            ->once()
            ->with(m::type('string'), m::on(fn (array $context) => ! str_contains(json_encode($context), 'parent@example.com')));

        $this->assertSame($report, $this->handler->handle('tl_abc', null));
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
        $report = $this->report();
        $this->erasure->shouldReceive('erase')->once()->with('parent@example.com')->andReturn($report);
        $this->expectConfirmationEmailTo('parent@example.com');

        $this->assertSame($report, $this->handler->handle('tl_abc', 'secret123'));
    }

    public function test_an_invalid_token_stops_everything(): void
    {
        $tokens = m::mock(TicketLookupTokenService::class);
        $tokens->shouldReceive('findValid')->andThrow(new InvalidTicketLookupTokenException('expired'));
        $this->erasure->shouldNotReceive('erase');

        $this->expectException(InvalidTicketLookupTokenException::class);

        (new ErasePersonalDataHandler($tokens, $this->customers, $this->erasure, $this->hasher, $this->mailer, $this->logger))->handle('bad', null);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
