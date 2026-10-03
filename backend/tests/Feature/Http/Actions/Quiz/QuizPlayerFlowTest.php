<?php

namespace Tests\Feature\Http\Actions\Quiz;

use HiEvents\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
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

    private function register(string $firstName = 'Amelia'): array
    {
        $response = $this->postJson($this->url('quiz-players/register'), [
            'first_name' => $firstName,
            'last_name' => 'Khan',
            'email' => 'parent@example.com',
            'password' => 'secret123',
        ]);

        $response->assertCreated();

        return $response->json('data');
    }

    public function test_registering_assigns_a_character_username_without_exposing_personal_details(): void
    {
        $session = $this->register();

        $this->assertMatchesRegularExpression('/^[A-Za-z][A-Za-z0-9]+\d{2,3}$/', $session['username']);
        $this->assertNotEmpty($session['token']);
        $this->assertArrayNotHasKey('email', $session);
        $this->assertArrayNotHasKey('first_name', $session);
        $this->assertDatabaseHas('quiz_players', ['username' => $session['username'], 'email' => 'parent@example.com']);
    }

    public function test_every_player_gets_a_different_username(): void
    {
        $usernames = collect(range(1, 8))->map(fn () => $this->register()['username']);

        $this->assertCount(8, $usernames->unique());
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
