<?php

namespace Tests\Feature\Http\Actions\Quiz;

use HiEvents\Mail\Quiz\QuizUsernameReminderEmail;
use HiEvents\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class QuizPlayerFlowTest extends TestCase
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

    private function usernameOptions(): array
    {
        return $this->getJson($this->url('quiz-players/username-options'))->assertOk()->json('data');
    }

    private function register(string $firstName = 'Amelia', ?string $email = null): array
    {
        $response = $this->postJson($this->url('quiz-players/register'), [
            'username' => $this->usernameOptions()[0],
            'first_name' => $firstName,
            'email' => $email ?? uniqid('parent').'@example.com',
            'age_band' => '14-17',
            'password' => 'secret123',
        ]);

        $response->assertCreated();

        return $response->json('data');
    }

    public function test_registering_creates_a_character_username_without_exposing_personal_details(): void
    {
        $session = $this->register('Amelia', 'parent@example.com');

        $this->assertMatchesRegularExpression('/^[A-Za-z][A-Za-z0-9]+\d{2,3}$/', $session['username']);
        $this->assertNotEmpty($session['token']);
        $this->assertArrayNotHasKey('email', $session);
        $this->assertArrayNotHasKey('first_name', $session);
        $this->assertDatabaseHas('quiz_players', ['username' => $session['username'], 'email' => 'parent@example.com']);
    }

    public function test_a_younger_player_needs_no_parent_email_and_appears_on_the_leaderboard_straight_away(): void
    {
        Mail::fake();

        $session = $this->postJson($this->url('quiz-players/register'), [
            'username' => $this->usernameOptions()[0],
            'first_name' => 'Amelia',
            'email' => 'child@example.com',
            'age_band' => '8-10',
            'password' => 'secret123',
        ])->assertCreated()->json('data');

        $headers = ['X-Quiz-Token' => $session['token']];

        $this->postJson($this->url('quiz-results'), ['age_band' => '8-10', 'score' => 20, 'total_questions' => 20], $headers)->assertOk();

        Mail::assertNothingQueued();
        $this->getJson($this->url('quiz-players/me'), $headers)->assertJsonMissingPath('data.leaderboard_status');

        $leaderboard = $this->getJson($this->url('quiz-leaderboard?age_band=8-10'))->json('data');
        $this->assertSame([$session['username']], array_column($leaderboard, 'username'));
        $this->assertSame(['rank', 'username', 'total_points', 'tests_taken', 'best_percentage'], array_keys($leaderboard[0]));
    }

    public function test_the_player_is_offered_ten_distinct_character_usernames_to_choose_from(): void
    {
        $options = $this->usernameOptions();

        $this->assertCount(10, $options);
        $this->assertCount(10, array_unique($options));
        $this->assertCount(10, array_unique(array_map(fn (string $name) => preg_replace('/\d+$/', '', $name), $options)));
    }

    public function test_the_player_gets_exactly_the_username_they_chose(): void
    {
        $chosen = $this->usernameOptions()[3];

        $response = $this->postJson($this->url('quiz-players/register'), [
            'username' => $chosen,
            'first_name' => 'Amelia',
            'email' => 'parent@example.com',
            'age_band' => '14-17',
            'password' => 'secret123',
        ])->assertCreated();

        $this->assertSame($chosen, $response->json('data.username'));
    }

    public function test_an_email_that_is_already_registered_cannot_register_another_username(): void
    {
        $this->register('Amelia', 'parent@example.com');

        $this->postJson($this->url('quiz-players/register'), [
            'username' => $this->usernameOptions()[0],
            'first_name' => 'Noah',
            'email' => 'Parent@Example.com',
            'age_band' => '14-17',
            'password' => 'secret123',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertSame(1, DB::table('quiz_players')->where('organizer_id', $this->organizerId)->count());
    }

    public function test_a_registered_email_can_request_its_username_by_email(): void
    {
        Mail::fake();
        $this->register('Amelia', 'parent@example.com');

        $this->postJson($this->url('quiz-players/forgot-username'), ['email' => 'PARENT@example.com'])->assertOk();

        Mail::assertQueued(QuizUsernameReminderEmail::class, fn (QuizUsernameReminderEmail $mail) => $mail->hasTo('parent@example.com'));
    }

    public function test_requesting_a_username_for_an_unknown_email_sends_nothing_and_reveals_nothing(): void
    {
        Mail::fake();

        $this->postJson($this->url('quiz-players/forgot-username'), ['email' => 'nobody@example.com'])->assertOk();

        Mail::assertNothingQueued();
    }

    public function test_a_username_that_is_already_taken_cannot_be_chosen_again(): void
    {
        $taken = $this->register()['username'];

        $this->postJson($this->url('quiz-players/register'), [
            'username' => strtolower($taken),
            'first_name' => 'Noah',
            'email' => 'other@example.com',
            'age_band' => '14-17',
            'password' => 'secret123',
        ])->assertUnprocessable()->assertJsonValidationErrors('username');
    }

    public function test_a_username_that_was_not_offered_is_rejected(): void
    {
        $this->postJson($this->url('quiz-players/register'), [
            'username' => 'MadeUpName77',
            'first_name' => 'Noah',
            'email' => 'other@example.com',
            'age_band' => '14-17',
            'password' => 'secret123',
        ])->assertUnprocessable()->assertJsonValidationErrors('username');
    }

    public function test_a_returning_player_can_sign_in_with_their_username_in_any_case(): void
    {
        $username = $this->register()['username'];

        $this->postJson($this->url('quiz-players/login'), ['username' => strtolower($username), 'password' => 'secret123'])
            ->assertOk()
            ->assertJsonPath('data.username', $username)
            ->assertJsonStructure(['data' => ['token']]);

        $this->postJson($this->url('quiz-players/login'), ['username' => $username, 'password' => 'wrong-password'])
            ->assertUnauthorized();
    }

    public function test_submitting_a_result_requires_a_signed_in_player(): void
    {
        $this->postJson($this->url('quiz-results'), ['age_band' => '8-10', 'score' => 10, 'total_questions' => 20])
            ->assertUnauthorized();
    }

    public function test_results_award_points_and_appear_in_the_profile_and_leaderboard(): void
    {
        $first = $this->register('Amelia');
        $second = $this->register('Noah');
        $headers = fn (array $session) => ['X-Quiz-Token' => $session['token']];

        $this->postJson($this->url('quiz-results'), ['age_band' => '8-10', 'score' => 20, 'total_questions' => 20], $headers($first))
            ->assertOk()
            ->assertJsonPath('data.points_awarded', 250)
            ->assertJsonPath('data.total_points', 250);

        $this->postJson($this->url('quiz-results'), ['age_band' => '8-10', 'score' => 10, 'total_questions' => 20], $headers($first))
            ->assertOk()
            ->assertJsonPath('data.points_awarded', 100)
            ->assertJsonPath('data.total_points', 350);

        $this->postJson($this->url('quiz-results'), ['age_band' => '8-10', 'score' => 15, 'total_questions' => 20], $headers($second))
            ->assertOk();

        $this->postJson($this->url('quiz-results'), ['age_band' => '5-7', 'score' => 20, 'total_questions' => 20], $headers($second))
            ->assertOk();

        $profile = $this->getJson($this->url('quiz-players/me'), $headers($first))->assertOk();
        $profile->assertJsonPath('data.username', $first['username']);
        $this->assertCount(2, $profile->json('data.results'));
        $this->assertSame(350, $profile->json('data.totals.0.total_points'));

        $leaderboard = $this->getJson($this->url('quiz-leaderboard?age_band=8-10'))->assertOk()->json('data');

        $this->assertSame([$first['username'], $second['username']], array_column($leaderboard, 'username'));
        $this->assertSame([1, 2], array_column($leaderboard, 'rank'));
        $this->assertSame([350, 160], array_column($leaderboard, 'total_points'));
        $this->assertArrayNotHasKey('email', $leaderboard[0]);
        $this->assertArrayNotHasKey('first_name', $leaderboard[0]);
    }

    public function test_a_token_from_another_organizer_is_rejected(): void
    {
        $session = $this->register();

        $this->getJson('/public/organizers/999999/quiz-players/me', ['X-Quiz-Token' => $session['token']])
            ->assertUnauthorized();
    }

    public function test_a_score_cannot_exceed_the_number_of_questions(): void
    {
        $session = $this->register();

        $this->postJson($this->url('quiz-results'), ['age_band' => '8-10', 'score' => 21, 'total_questions' => 20], ['X-Quiz-Token' => $session['token']])
            ->assertUnprocessable();
    }
}
