<?php

namespace HiEvents\Mail\Quiz;

use HiEvents\Mail\BaseMail;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * @uses /backend/resources/views/emails/quiz/parent-consent.blade.php
 */
class QuizParentConsentEmail extends BaseMail
{
    public function __construct(
        private readonly string $childFirstName,
        private readonly string $username,
        private readonly string $ageGroup,
        private readonly string $organizerName,
        private readonly string $consentUrl,
        private readonly int $validDays,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __(':child would like to join the :organizer puzzles leaderboard', [
                'child' => $this->childFirstName,
                'organizer' => $this->organizerName,
            ]),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.quiz.parent-consent',
            with: [
                'childFirstName' => $this->childFirstName,
                'username' => $this->username,
                'ageGroup' => $this->ageGroup,
                'organizerName' => $this->organizerName,
                'consentUrl' => $this->consentUrl,
                'validDays' => $this->validDays,
            ]
        );
    }
}
