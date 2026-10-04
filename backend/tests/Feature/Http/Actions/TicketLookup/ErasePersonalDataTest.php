<?php

namespace Tests\Feature\Http\Actions\TicketLookup;

use HiEvents\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use HiEvents\Mail\PersonalData\PersonalDataErasedEmail;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ErasePersonalDataTest extends TestCase
{
    use DatabaseTransactions;

    private int $organizerId;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        $accountId = User::factory()->withAccount()->create()->accounts()->first()->id;

        $this->organizerId = DB::table('organizers')->insertGetId([
            'account_id' => $accountId,
            'name' => 'Erasure Organizer',
            'email' => 'organizer-'.uniqid().'@test.com',
            'currency' => 'USD',
            'timezone' => 'UTC',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function lookupToken(string $email): string
    {
        $token = 'tl_'.uniqid();

        DB::table('ticket_lookup_tokens')->insert([
            'email' => $email,
            'token' => $token,
            'expires_at' => now()->addHour(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $token;
    }

    private function url(string $token): string
    {
        return "/public/ticket-lookup/{$token}/erase-personal-data";
    }

    public function test_the_confirmation_word_is_required(): void
    {
        $token = $this->lookupToken('parent@example.com');

        $this->postJson($this->url($token), [])->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $this->postJson($this->url($token), ['confirmation' => 'yes'])->assertUnprocessable();
    }

    public function test_an_unknown_token_is_rejected(): void
    {
        $this->postJson($this->url('tl_nope'), ['confirmation' => 'DELETE'])->assertStatus(400);
    }

    public function test_an_account_with_a_password_must_supply_it(): void
    {
        DB::table('customers')->insert([
            'organizer_id' => $this->organizerId,
            'first_name' => 'Pat',
            'last_name' => 'Parent',
            'email' => 'parent@example.com',
            'password' => Hash::make('secret123'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $token = $this->lookupToken('parent@example.com');

        $this->postJson($this->url($token), ['confirmation' => 'DELETE', 'password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
        $this->assertDatabaseHas('customers', ['email' => 'parent@example.com']);

        $this->postJson($this->url($token), ['confirmation' => 'DELETE', 'password' => 'secret123'])->assertOk();

        $this->assertDatabaseMissing('customers', ['email' => 'parent@example.com']);
        Mail::assertSent(PersonalDataErasedEmail::class, fn (PersonalDataErasedEmail $mail) => $mail->hasTo('parent@example.com'));
        $this->assertDatabaseMissing('ticket_lookup_tokens', ['token' => $token]);
        $this->assertDatabaseHas('data_erasure_requests', [
            'email_hash' => hash_hmac('sha256', 'parent@example.com', (string) config('app.key')),
        ]);
    }

    public function test_the_childrens_puzzle_accounts_linked_to_the_parent_email_are_deleted(): void
    {
        $username = $this->getJson("/public/organizers/{$this->organizerId}/quiz-players/username-options")->json('data.0');

        $this->postJson("/public/organizers/{$this->organizerId}/quiz-players/register", [
            'username' => $username,
            'first_name' => 'Amelia',
            'email' => 'child@example.com',
            'age_band' => '8-10',
            'parent_email' => 'parent@example.com',
            'password' => 'secret123',
        ])->assertCreated();
        $this->assertDatabaseHas('quiz_players', ['email' => 'child@example.com']);

        $token = $this->lookupToken('parent@example.com');

        $this->postJson($this->url($token), ['confirmation' => 'DELETE'])->assertOk();

        $this->assertDatabaseMissing('quiz_players', ['email' => 'child@example.com']);
        $this->assertDatabaseMissing('parental_consents', ['parent_email' => 'parent@example.com']);
    }
}
