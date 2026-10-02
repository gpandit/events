<?php

namespace HiEvents\Services\Infrastructure\Turnstile;

use Illuminate\Support\Facades\Http;
use Throwable;

class TurnstileVerifier
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function isEnabled(): bool
    {
        return !empty(config('services.turnstile.secret_key'));
    }

    public function verify(?string $token, ?string $ip = null): bool
    {
        if (!$this->isEnabled()) {
            return true;
        }

        if (empty($token)) {
            return false;
        }

        try {
            $response = Http::asForm()->timeout(10)->post(self::VERIFY_URL, array_filter([
                'secret' => config('services.turnstile.secret_key'),
                'response' => $token,
                'remoteip' => $ip,
            ]));
        } catch (Throwable) {
            return false;
        }

        return $response->successful() && $response->json('success') === true;
    }
}
