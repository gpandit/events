<?php

namespace Tests\Feature\Http\Actions\Quiz;

use HiEvents\Mail\Quiz\QuizPasswordResetEmail;
use HiEvents\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class QuizPasswordResetTest extends TestCase
{
    use DatabaseTransactions;

    private int $organizerId;

    protected function setUp(): void
    {
        parent::setUp();

        $accountId = User::factory()->withAccount()->create()->accounts()->first()->id;

        $this->organizerId = DB::table('organizers')->insertGetId([
            'account_id' => $accountId,
            'name' => 'Quiz Organizer',
            'email' => 'organizer-'.uniqid().'@test.com',
            'currency' => 'USD',
            'timezone' => 'UTC',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function url(string $path): string
    {
        return "/public/organizers/{$this->organizerId}/{$path}";
    }

    private function register(?string $email): string
    {
        $payload = ['first_name' => 'Noah', 'last_name' => 'Smith', 'password' => 'secret123'];

        if ($email !== null) {
            $payload['email'] = $email;
        }

        return $this->postJson($this->url('quiz-players/register'), $payload)->assertCreated()->json('data.username');
    }

    public function test_email_is_optional_when_signing_up(): void
    {
        $username = $this->register(null);

        $this->assertDatabaseHas('quiz_players', ['username' => $username, 'email' => null]);
    }

    public function test_a_player_with_an_email_resets_their_password_with_a_magic_link(): void
    {
        $username = $this->register('older.kid@example.com');
        Mail::fake();

        $this->postJson($this->url('quiz-players/forgot-password'), ['username' => strtolower($username)])->assertOk();

        $url = null;
        Mail::assertQueued(QuizPasswordResetEmail::class, function (QuizPasswordResetEmail $mail) use (&$url) {
            $url = $mail->content()->with['resetUrl'];

            return $mail->hasTo('older.kid@example.com');
        });
        parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

        $this->postJson($this->url('quiz-players/reset-password'), ['token' => $query['reset_token'], 'password' => 'brand-new-1'])
            ->assertOk()
            ->assertJsonPath('data.username', $username)
            ->assertJsonStructure(['data' => ['token']]);

        $this->postJson($this->url('quiz-players/login'), ['username' => $username, 'password' => 'brand-new-1'])->assertOk();
        $this->postJson($this->url('quiz-players/login'), ['username' => $username, 'password' => 'secret123'])->assertUnauthorized();

        $this->postJson($this->url('quiz-players/reset-password'), ['token' => $query['reset_token'], 'password' => 'brand-new-2'])
            ->assertUnprocessable();
    }

    public function test_no_email_is_sent_for_players_without_an_email_or_unknown_usernames(): void
    {
        $username = $this->register(null);
        Mail::fake();

        $this->postJson($this->url('quiz-players/forgot-password'), ['username' => $username])->assertOk();
        $this->postJson($this->url('quiz-players/forgot-password'), ['username' => 'Nobody999'])->assertOk();

        Mail::assertNothingQueued();
    }
}
