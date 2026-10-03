<?php

namespace HiEvents\Mail\Customer;

use HiEvents\Mail\BaseMail;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * @uses /backend/resources/views/emails/customer/password-setup.blade.php
 */
class CustomerPasswordSetupEmail extends BaseMail
{
    public function __construct(
        private readonly string $firstName,
        private readonly string $organizerName,
        private readonly string $setupUrl,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('Set your password for :organizer', ['organizer' => $this->organizerName]),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.customer.password-setup',
            with: [
                'firstName' => $this->firstName,
                'organizerName' => $this->organizerName,
                'setupUrl' => $this->setupUrl,
            ]
        );
    }
}
