<?php

namespace HiEvents\Mail\ChildStory;

use HiEvents\Mail\BaseMail;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * @uses /backend/resources/views/emails/child-story/parent-consent.blade.php
 */
class ChildStoryParentConsentEmail extends BaseMail
{
    public function __construct(
        private readonly string $childFirstName,
        private readonly string $childLastInitial,
        private readonly string $workType,
        private readonly string $yearGroup,
        private readonly string $submittedOn,
        private readonly string $organizerName,
        private readonly string $consentUrl,
        private readonly int $validDays,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __(':child has submitted work to :organizer - your permission is needed', [
                'child' => $this->childFirstName,
                'organizer' => $this->organizerName,
            ]),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.child-story.parent-consent',
            with: [
                'childFirstName' => $this->childFirstName,
                'childLastInitial' => $this->childLastInitial,
                'workType' => $this->workType,
                'yearGroup' => $this->yearGroup,
                'submittedOn' => $this->submittedOn,
                'organizerName' => $this->organizerName,
                'consentUrl' => $this->consentUrl,
                'validDays' => $this->validDays,
            ]
        );
    }
}
