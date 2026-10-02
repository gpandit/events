<?php

namespace HiEvents\Services\Application\Handlers\Contact;

use HiEvents\Mail\SiteContactEmail;
use HiEvents\Services\Application\Handlers\Contact\DTO\SubmitSiteContactMessageDTO;
use HiEvents\Services\Infrastructure\HtmlPurifier\HtmlPurifierService;
use Illuminate\Mail\Mailer;

class SubmitSiteContactMessageHandler
{
    public function __construct(
        private readonly Mailer $mailer,
        private readonly HtmlPurifierService $purifier,
    ) {}

    public function handle(SubmitSiteContactMessageDTO $dto): void
    {
        $purifiedMessage = $this->purifier->purify($dto->message);

        $recipient = config('mail.site_contact_email');
        $subjectTag = config('mail.site_contact_subject_tag');

        $this->mailer
            ->to($recipient)
            ->send(new SiteContactEmail(
                senderName: $dto->name,
                senderEmail: $dto->email,
                messageContent: $purifiedMessage,
                subjectTag: $subjectTag,
            ));
    }
}
