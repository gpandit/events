<?php

namespace HiEvents\Mail\Quiz;

use HiEvents\Mail\BaseMail;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * @uses /backend/resources/views/emails/quiz/username-reminder.blade.php
 */
class QuizUsernameReminderEmail extends BaseMail
{
    /**
     * @param  string[]  $usernames
     */
    public function __construct(
        private readonly array $usernames,
        private readonly string $organizerName,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('Your puzzle username'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.quiz.username-reminder',
            with: [
                'usernames' => $this->usernames,
                'organizerName' => $this->organizerName,
            ]
        );
    }
}
