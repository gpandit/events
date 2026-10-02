<?php

namespace Tests\Unit\Services\Infrastructure\Turnstile;

use HiEvents\Services\Infrastructure\Turnstile\TurnstileVerifier;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TurnstileVerifierTest extends TestCase
{
    public function testPassesWhenSecretIsNotConfigured(): void
    {
        config(['services.turnstile.secret_key' => null]);
        Http::fake();

        $this->assertTrue((new TurnstileVerifier())->verify(null));
        Http::assertNothingSent();
    }

    public function testRejectsMissingToken(): void
    {
        config(['services.turnstile.secret_key' => 'secret']);
        Http::fake();

        $this->assertFalse((new TurnstileVerifier())->verify(null));
        Http::assertNothingSent();
    }

    public function testAcceptsTokenCloudflareApproves(): void
    {
        config(['services.turnstile.secret_key' => 'secret']);
        Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => true])]);

        $this->assertTrue((new TurnstileVerifier())->verify('token', '1.2.3.4'));
    }

    public function testRejectsTokenCloudflareDeclines(): void
    {
        config(['services.turnstile.secret_key' => 'secret']);
        Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => false])]);

        $this->assertFalse((new TurnstileVerifier())->verify('token'));
    }
}
