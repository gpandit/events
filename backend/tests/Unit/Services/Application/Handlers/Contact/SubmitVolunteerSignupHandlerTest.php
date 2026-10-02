<?php

namespace Tests\Unit\Services\Application\Handlers\Contact;

use HiEvents\Mail\VolunteerSignupEmail;
use HiEvents\Services\Application\Handlers\Contact\DTO\SubmitVolunteerSignupDTO;
use HiEvents\Services\Application\Handlers\Contact\SubmitVolunteerSignupHandler;
use HiEvents\Services\Infrastructure\HtmlPurifier\HtmlPurifierService;
use Illuminate\Mail\Mailer;
use Illuminate\Mail\PendingMail;
use Mockery;
use Tests\TestCase;

class SubmitVolunteerSignupHandlerTest extends TestCase
{
    public function testSendsSignupToContactEmailWithCc(): void
    {
        config([
            'mail.site_contact_email' => 'to@example.com',
            'mail.site_contact_cc_email' => 'cc@example.com',
        ]);

        $mailer = Mockery::mock(Mailer::class);
        $pending = Mockery::mock(PendingMail::class);
        $purifier = Mockery::mock(HtmlPurifierService::class);

        $purifier->shouldReceive('purify')->once()->with('Happy to help')->andReturn('Happy to help');
        $mailer->shouldReceive('to')->once()->with('to@example.com')->andReturn($pending);
        $pending->shouldReceive('cc')->once()->with('cc@example.com')->andReturn($pending);
        $pending->shouldReceive('send')->once()->with(Mockery::type(VolunteerSignupEmail::class));

        (new SubmitVolunteerSignupHandler($mailer, $purifier))->handle(SubmitVolunteerSignupDTO::from([
            'firstName' => 'Jane',
            'lastName' => 'Doe',
            'email' => 'jane@example.com',
            'phone' => '+971500000000',
            'message' => 'Happy to help',
        ]));
    }
}
