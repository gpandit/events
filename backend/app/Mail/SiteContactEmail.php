<?php

namespace HiEvents\Mail;

use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class SiteContactEmail extends BaseMail
{
    public function __construct(
        private readonly string $senderName,
        private readonly string $senderEmail,
        private readonly string $messageContent,
        private readonly string $subjectTag,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address($this->senderEmail, $this->senderName)],
            subject: "[{$this->subjectTag}] " . __('New website contact form message'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.site-contact-message',
            with: [
                'senderName' => $this->senderName,
                'senderEmail' => $this->senderEmail,
                'replySubject' => urlencode("[{$this->subjectTag}] " . __('Response to your message')),
                'messageContent' => $this->messageContent,
            ],
        );
    }
}
