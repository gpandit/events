<?php

namespace HiEvents\Mail;

use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class VolunteerSignupEmail extends BaseMail
{
    public function __construct(
        private readonly string $firstName,
        private readonly string $lastName,
        private readonly string $email,
        private readonly string $phone,
        private readonly ?string $messageContent,
        private readonly string $subjectTag,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address($this->email, "{$this->firstName} {$this->lastName}")],
            subject: "[{$this->subjectTag}] " . __('New volunteer sign-up'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.volunteer-signup',
            with: [
                'firstName' => $this->firstName,
                'lastName' => $this->lastName,
                'email' => $this->email,
                'phone' => $this->phone,
                'messageContent' => $this->messageContent,
                'replySubject' => urlencode("[{$this->subjectTag}] " . __('Thank you for volunteering')),
            ],
        );
    }
}
