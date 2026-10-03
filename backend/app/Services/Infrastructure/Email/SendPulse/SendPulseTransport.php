<?php

namespace HiEvents\Services\Infrastructure\Email\SendPulse;

use HiEvents\Exceptions\SendPulseDeliveryException;
use Illuminate\Contracts\Cache\Repository as Cache;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpClient;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;
use Symfony\Component\Mime\Part\DataPart;

class SendPulseTransport extends AbstractTransport
{
    private const API_URL = 'https://api.sendpulse.com';

    private const TOKEN_CACHE_KEY = 'sendpulse.access_token';

    private const TOKEN_EXPIRY_MARGIN_SECONDS = 60;

    private const TIMEOUT_SECONDS = 15;

    public function __construct(
        private readonly HttpClient $http,
        private readonly Cache $cache,
        private readonly string $clientId,
        private readonly string $clientSecret,
    ) {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $payload = array_filter([
            'subject' => $email->getSubject(),
            'from' => $this->formatAddress($email->getFrom()[0]),
            'to' => array_map($this->formatAddress(...), $email->getTo()),
            'cc' => array_map($this->formatAddress(...), $email->getCc()),
            'bcc' => array_map($this->formatAddress(...), $email->getBcc()),
            'html' => $email->getHtmlBody() !== null ? base64_encode($email->getHtmlBody()) : null,
            'text' => $email->getTextBody(),
            'attachments_binary' => $this->formatAttachments($email->getAttachments()),
        ]);

        try {
            $response = $this->request()
                ->post(self::API_URL.'/smtp/emails', ['email' => $payload])
                ->throw();
        } catch (RequestException|ConnectionException $exception) {
            throw new SendPulseDeliveryException(
                'SendPulse rejected the message: '.$exception->getMessage(),
                previous: $exception,
            );
        }

        if ($response->json('result') !== true) {
            throw new SendPulseDeliveryException('SendPulse did not accept the message: '.$response->body());
        }
    }

    public function __toString(): string
    {
        return 'sendpulse';
    }

    private function request(): PendingRequest
    {
        return $this->http
            ->timeout(self::TIMEOUT_SECONDS)
            ->withToken($this->accessToken())
            ->acceptJson();
    }

    private function accessToken(): string
    {
        $cached = $this->cache->get(self::TOKEN_CACHE_KEY);

        if (is_string($cached)) {
            return $cached;
        }

        try {
            $response = $this->http
                ->timeout(self::TIMEOUT_SECONDS)
                ->acceptJson()
                ->post(self::API_URL.'/oauth/access_token', [
                    'grant_type' => 'client_credentials',
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                ])
                ->throw();
        } catch (RequestException|ConnectionException $exception) {
            throw new SendPulseDeliveryException(
                'SendPulse authentication failed: '.$exception->getMessage(),
                previous: $exception,
            );
        }

        $token = $response->json('access_token');

        if (! is_string($token) || $token === '') {
            throw new SendPulseDeliveryException('SendPulse authentication response contained no access token.');
        }

        $this->cache->put(
            self::TOKEN_CACHE_KEY,
            $token,
            max(1, (int) $response->json('expires_in', 3600) - self::TOKEN_EXPIRY_MARGIN_SECONDS),
        );

        return $token;
    }

    private function formatAddress(Address $address): array
    {
        return ['name' => $address->getName(), 'email' => $address->getAddress()];
    }

    /**
     * @param  DataPart[]  $attachments
     * @return array<string, string>
     */
    private function formatAttachments(array $attachments): array
    {
        $formatted = [];

        foreach ($attachments as $attachment) {
            $formatted[$attachment->getFilename() ?? 'attachment'] = base64_encode($attachment->getBody());
        }

        return $formatted;
    }
}
