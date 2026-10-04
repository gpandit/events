<?php

namespace HiEvents\Mail\PersonalData;

use HiEvents\Mail\BaseMail;
use HiEvents\Services\Domain\PersonalData\DTO\PersonalDataErasureReportDTO;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * @uses /backend/resources/views/emails/personal-data/erased.blade.php
 */
class PersonalDataErasedEmail extends BaseMail
{
    public function __construct(
        private readonly PersonalDataErasureReportDTO $report,
        private readonly string $supportEmail,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('Your personal data has been deleted'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.personal-data.erased',
            with: [
                'report' => $this->report,
                'supportEmail' => $this->supportEmail,
            ]
        );
    }
}
