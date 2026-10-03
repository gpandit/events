<?php

namespace Tests\Unit\Services\Infrastructure\Email\SendPulse;

use HiEvents\Exceptions\SendPulseDeliveryException;
use HiEvents\Services\Infrastructure\Email\SendPulse\SendPulseTransport;
use Illuminate\Cache\ArrayStore;
use Illuminate\Cache\Repository;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\Request;
use Symfony\Component\Mime\Email;
use Tests\TestCase;

class SendPulseTransportTest extends TestCase
{
    private Factory $http;

    private Repository $cache;

    protected function setUp(): void
    {
        parent::setUp();

        $this->http = new Factory;
        $this->cache = new Repository(new ArrayStore);
    }

    public function test_sends_message_with_bearer_token_and_encoded_body(): void
    {
        $this->http->fake([
            'api.sendpulse.com/oauth/access_token' => $this->http->response(['access_token' => 'tok', 'expires_in' => 3600]),
            'api.sendpulse.com/smtp/emails' => $this->http->response(['result' => true]),
        ]);

        $this->transport()->send($this->email());

        $this->http->assertSent(fn (Request $request) => $request->url() === 'https://api.sendpulse.com/oauth/access_token'
            && $request['client_id'] === 'id'
            && $request['client_secret'] === 'secret');

        $this->http->assertSent(function (Request $request) {
            if ($request->url() !== 'https://api.sendpulse.com/smtp/emails') {
                return false;
            }

            $email = $request['email'];

            return $request->hasHeader('Authorization', 'Bearer tok')
                && $email['subject'] === 'Your order'
                && $email['from'] === ['name' => 'Friends', 'email' => 'from@example.com']
                && $email['to'] === [['name' => 'Jane', 'email' => 'to@example.com']]
                && $email['html'] === base64_encode('<p>Hello</p>')
                && $email['text'] === 'Hello';
        });
    }

    public function test_sends_attachments_as_base64(): void
    {
        $this->http->fake([
            'api.sendpulse.com/oauth/access_token' => $this->http->response(['access_token' => 'tok']),
            'api.sendpulse.com/smtp/emails' => $this->http->response(['result' => true]),
        ]);

        $this->transport()->send($this->email()->attach('BEGIN:VCALENDAR', 'event.ics', 'text/calendar'));

        $this->http->assertSent(fn (Request $request) => str_ends_with($request->url(), '/smtp/emails')
            && $request['email']['attachments_binary'] === ['event.ics' => base64_encode('BEGIN:VCALENDAR')]);
    }

    public function test_reuses_cached_access_token(): void
    {
        $this->http->fake([
            'api.sendpulse.com/oauth/access_token' => $this->http->response(['access_token' => 'tok', 'expires_in' => 3600]),
            'api.sendpulse.com/smtp/emails' => $this->http->response(['result' => true]),
        ]);

        $transport = $this->transport();
        $transport->send($this->email());
        $transport->send($this->email());

        $this->http->assertSentCount(3);
    }

    public function test_throws_when_authentication_fails(): void
    {
        $this->http->fake(['api.sendpulse.com/oauth/access_token' => $this->http->response(['error' => 'invalid_client'], 401)]);

        $this->expectException(SendPulseDeliveryException::class);

        $this->transport()->send($this->email());
    }

    public function test_throws_when_send_pulse_rejects_message(): void
    {
        $this->http->fake([
            'api.sendpulse.com/oauth/access_token' => $this->http->response(['access_token' => 'tok']),
            'api.sendpulse.com/smtp/emails' => $this->http->response(['error' => 'bad'], 400),
        ]);

        $this->expectException(SendPulseDeliveryException::class);

        $this->transport()->send($this->email());
    }

    public function test_throws_when_send_pulse_reports_unsuccessful_result(): void
    {
        $this->http->fake([
            'api.sendpulse.com/oauth/access_token' => $this->http->response(['access_token' => 'tok']),
            'api.sendpulse.com/smtp/emails' => $this->http->response(['result' => false]),
        ]);

        $this->expectException(SendPulseDeliveryException::class);

        $this->transport()->send($this->email());
    }

    private function transport(): SendPulseTransport
    {
        return new SendPulseTransport($this->http, $this->cache, 'id', 'secret');
    }

    private function email(): Email
    {
        return (new Email)
            ->from('Friends <from@example.com>')
            ->to('Jane <to@example.com>')
            ->subject('Your order')
            ->html('<p>Hello</p>')
            ->text('Hello');
    }
}
