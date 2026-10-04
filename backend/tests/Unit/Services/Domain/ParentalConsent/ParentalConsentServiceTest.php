<?php

namespace Tests\Unit\Services\Domain\ParentalConsent;

use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\ParentalConsentDomainObject;
use HiEvents\DomainObjects\Status\ParentalConsentStatus;
use HiEvents\Exceptions\InvalidParentalConsentTokenException;
use HiEvents\Exceptions\ParentalConsentNotRespondableException;
use HiEvents\Repository\Interfaces\ParentalConsentRepositoryInterface;
use HiEvents\Services\Domain\ParentalConsent\ParentalConsentService;
use Mockery as m;
use Tests\TestCase;

class ParentalConsentServiceTest extends TestCase
{
    private ParentalConsentRepositoryInterface $repository;

    private ParentalConsentService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = m::mock(ParentalConsentRepositoryInterface::class);
        $this->service = new ParentalConsentService($this->repository);
    }

    public function test_request_stores_a_hashed_token_and_returns_the_plain_token(): void
    {
        $this->repository->shouldReceive('deleteWhere')
            ->once()
            ->with(['subject_type' => 'CHILD_STORY', 'subject_id' => 3]);

        $stored = null;
        $this->repository->shouldReceive('create')
            ->once()
            ->with(m::on(function (array $attributes) use (&$stored) {
                $stored = $attributes;

                return true;
            }))
            ->andReturn(new ParentalConsentDomainObject);

        $token = $this->service->request(10, ParentalConsentSubject::CHILD_STORY, 3, ' Parent@Example.com ');

        $this->assertSame(48, strlen($token));
        $this->assertSame(hash('sha256', $token), $stored['token_hash']);
        $this->assertSame('parent@example.com', $stored['parent_email']);
        $this->assertSame(ParentalConsentStatus::PENDING->value, $stored['status']);
        $this->assertSame(10, $stored['organizer_id']);
        $this->assertTrue($stored['expires_at']->isFuture());
    }

    public function test_find_by_token_throws_for_an_unknown_token(): void
    {
        $this->repository->shouldReceive('findFirstWhere')
            ->once()
            ->with(['organizer_id' => 10, 'token_hash' => hash('sha256', 'nope')])
            ->andReturn(null);

        $this->expectException(InvalidParentalConsentTokenException::class);

        $this->service->findByToken(10, 'nope');
    }

    public function test_respond_records_the_decision(): void
    {
        $consent = (new ParentalConsentDomainObject)
            ->setId(9)
            ->setStatus('PENDING')
            ->setExpiresAt(now()->addDay()->toDateTimeString());
        $updated = new ParentalConsentDomainObject;

        $this->repository->shouldReceive('updateFromArray')
            ->once()
            ->with(9, m::on(fn (array $attributes) => $attributes['status'] === 'GRANTED' && isset($attributes['responded_at'])))
            ->andReturn($updated);

        $this->assertSame($updated, $this->service->respond($consent, true));
    }

    public function test_respond_refuses_a_second_response(): void
    {
        $consent = (new ParentalConsentDomainObject)
            ->setId(9)
            ->setStatus('GRANTED')
            ->setExpiresAt(now()->addDay()->toDateTimeString());

        $this->repository->shouldNotReceive('updateFromArray');
        $this->expectException(ParentalConsentNotRespondableException::class);

        $this->service->respond($consent, false);
    }

    public function test_respond_refuses_an_expired_request(): void
    {
        $consent = (new ParentalConsentDomainObject)
            ->setId(9)
            ->setStatus('PENDING')
            ->setExpiresAt(now()->subMinute()->toDateTimeString());

        $this->repository->shouldNotReceive('updateFromArray');
        $this->expectException(ParentalConsentNotRespondableException::class);

        $this->service->respond($consent, true);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
