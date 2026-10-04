<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\PersonalData;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\Exceptions\InvalidCredentialsException;
use HiEvents\Exceptions\InvalidTicketLookupTokenException;
use HiEvents\Mail\PersonalData\PersonalDataErasedEmail;
use HiEvents\Repository\Interfaces\CustomerRepositoryInterface;
use HiEvents\Services\Domain\PersonalData\DTO\PersonalDataErasureReportDTO;
use HiEvents\Services\Domain\PersonalData\PersonalDataErasureService;
use HiEvents\Services\Domain\TicketLookup\TicketLookupTokenService;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Contracts\Mail\Mailer;
use Psr\Log\LoggerInterface;
use Throwable;

class ErasePersonalDataHandler
{
    public function __construct(
        private readonly TicketLookupTokenService $ticketLookupTokenService,
        private readonly CustomerRepositoryInterface $customerRepository,
        private readonly PersonalDataErasureService $erasureService,
        private readonly Hasher $hasher,
        private readonly Mailer $mailer,
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * @throws InvalidTicketLookupTokenException
     * @throws InvalidCredentialsException
     */
    public function handle(string $token, ?string $password): PersonalDataErasureReportDTO
    {
        $email = mb_strtolower(trim($this->ticketLookupTokenService->findValid($token)->getEmail()));

        $this->assertPasswordMatchesWhenAccountHasOne($email, $password);

        $report = $this->erasureService->erase($email);

        $this->sendConfirmation($email, $report);

        return $report;
    }

    private function sendConfirmation(string $email, PersonalDataErasureReportDTO $report): void
    {
        try {
            $this->mailer
                ->to($email)
                ->sendNow(new PersonalDataErasedEmail($report, (string) config('mail.site_contact_email')));
        } catch (Throwable $exception) {
            $this->logger->error('Failed to send the personal data erasure confirmation email', [
                'exception' => $exception::class,
            ]);
        }
    }

    /**
     * @throws InvalidCredentialsException
     */
    private function assertPasswordMatchesWhenAccountHasOne(string $email, ?string $password): void
    {
        $passwordHashes = $this->customerRepository
            ->findWhere([fn ($query) => $query->whereRaw('LOWER(email) = ?', [$email])])
            ->map(fn (CustomerDomainObject $customer) => $customer->getPassword())
            ->filter();

        if ($passwordHashes->isEmpty()) {
            return;
        }

        $matches = $password !== null
            && $passwordHashes->contains(fn (string $hash) => $this->hasher->check($password, $hash));

        if (! $matches) {
            throw new InvalidCredentialsException(__('Password is incorrect'));
        }
    }
}
