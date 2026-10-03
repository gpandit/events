<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\Customer;

use HiEvents\DomainObjects\CustomerDomainObject;
use HiEvents\DomainObjects\Enums\PasswordSetupSubject;
use HiEvents\Helper\Url;
use HiEvents\Mail\Customer\CustomerPasswordSetupEmail;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Services\Domain\PasswordSetup\PasswordSetupTokenService;
use Illuminate\Contracts\Mail\Mailer;

class CustomerPasswordSetupMailer
{
    public function __construct(
        private readonly PasswordSetupTokenService $tokenService,
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly Mailer $mailer,
    ) {}

    public function send(CustomerDomainObject $customer): void
    {
        $organizer = $this->organizerRepository->findById($customer->getOrganizerId());
        $token = $this->tokenService->issue(PasswordSetupSubject::CUSTOMER, $customer->getId());

        $this->mailer
            ->to($customer->getEmail())
            ->queue(new CustomerPasswordSetupEmail(
                firstName: $customer->getFirstName(),
                organizerName: $organizer->getName(),
                setupUrl: sprintf(
                    Url::getFrontEndUrlFromConfig(Url::CUSTOMER_ACCOUNT),
                    $organizer->getId(),
                    $organizer->getSlug(),
                    $token,
                ),
            ));
    }
}
