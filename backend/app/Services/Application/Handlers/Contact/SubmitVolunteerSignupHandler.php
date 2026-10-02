<?php

namespace HiEvents\Services\Application\Handlers\Contact;

use HiEvents\Mail\VolunteerSignupEmail;
use HiEvents\Services\Application\Handlers\Contact\DTO\SubmitVolunteerSignupDTO;
use HiEvents\Services\Infrastructure\HtmlPurifier\HtmlPurifierService;
use Illuminate\Mail\Mailer;

class SubmitVolunteerSignupHandler
{
    public function __construct(
        private readonly Mailer $mailer,
        private readonly HtmlPurifierService $purifier,
    ) {}

    public function handle(SubmitVolunteerSignupDTO $dto): void
    {
        $this->mailer
            ->to(config('mail.site_contact_email'))
            ->cc(config('mail.site_contact_cc_email'))
            ->send(new VolunteerSignupEmail(
                firstName: $dto->firstName,
                lastName: $dto->lastName,
                email: $dto->email,
                phone: $dto->phone,
                messageContent: $dto->message ? $this->purifier->purify($dto->message) : null,
                subjectTag: config('mail.site_contact_subject_tag'),
            ));
    }
}
