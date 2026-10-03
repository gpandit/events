<?php

namespace HiEvents\Mail\Quiz;

use HiEvents\Mail\BaseMail;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * @uses /backend/resources/views/emails/quiz/password-reset.blade.php
 */
class QuizPasswordResetEmail extends BaseMail
{
    public function __construct(
        private readonly string $username,
        private readonly string $organizerName,
        private readonly string $resetUrl,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('Reset your puzzle password'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.quiz.password-reset',
            with: [
                'username' => $this->username,
                'organizerName' => $this->organizerName,
                'resetUrl' => $this->resetUrl,
            ]
        );
    }
}
