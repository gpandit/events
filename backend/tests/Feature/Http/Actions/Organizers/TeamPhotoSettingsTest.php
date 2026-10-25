<?php

namespace Tests\Feature\Http\Actions\Organizers;

use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Http\ResponseCodes;
use HiEvents\Models\AccountConfiguration;
use HiEvents\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class TeamPhotoSettingsTest extends TestCase
{
    use DatabaseTransactions;

    private string $token;

    private int $accountId;

    private int $organizerId;

    private int $otherOrganizerId;

    protected function setUp(): void
    {
        parent::setUp();

        AccountConfiguration::firstOrCreate(['id' => 1], [
            'id' => 1,
            'name' => 'Default',
            'is_system_default' => true,
            'application_fees' => ['percentage' => 1.5, 'fixed' => 0],
        ]);

        $user = User::factory()->withAccount()->create();
        $this->accountId = $user->accounts()->first()->id;
        DB::table('account_users')->where('user_id', $user->id)->update(['role' => 'ADMIN']);
        $this->token = JWTAuth::claims(['account_id' => $this->accountId])->fromUser($user);

        $this->organizerId = $this->makeOrganizer();
        $this->otherOrganizerId = $this->makeOrganizer();

        DB::table('organizer_settings')->insert([
            'organizer_id' => $this->organizerId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_a_team_member_can_use_a_team_photo_uploaded_for_this_organizer(): void
    {
        $imageId = $this->makeImage($this->organizerId, 'TEAM_MEMBER_PHOTO');

        $this->saveTeam([['name' => 'Priya', 'role' => 'Chair', 'image_id' => $imageId]])
            ->assertStatus(ResponseCodes::HTTP_OK);
    }

    public function test_a_team_member_cannot_use_another_organizers_photo(): void
    {
        $imageId = $this->makeImage($this->otherOrganizerId, 'TEAM_MEMBER_PHOTO');

        $this->saveTeam([['name' => 'Priya', 'image_id' => $imageId]])
            ->assertStatus(ResponseCodes::HTTP_UNPROCESSABLE_ENTITY)
            ->assertJsonValidationErrors(['homepage_theme_settings.team_members.0.image_id']);
    }

    public function test_a_team_member_cannot_use_an_image_that_is_not_a_team_photo(): void
    {
        $logoId = $this->makeImage($this->organizerId, 'ORGANIZER_LOGO');

        $this->saveTeam([['name' => 'Priya', 'image_id' => $logoId]])
            ->assertStatus(ResponseCodes::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function test_a_team_member_cannot_use_an_image_that_does_not_exist(): void
    {
        $this->saveTeam([['name' => 'Priya', 'image_id' => 987654321]])
            ->assertStatus(ResponseCodes::HTTP_UNPROCESSABLE_ENTITY);
    }

    private function saveTeam(array $members)
    {
        $this->app['auth']->forgetGuards();

        return $this->patchJson(
            "/organizers/{$this->organizerId}/settings",
            ['homepage_theme_settings' => ['team_members' => $members]],
            ['Authorization' => "Bearer {$this->token}"],
        );
    }

    private function makeOrganizer(): int
    {
        return DB::table('organizers')->insertGetId([
            'account_id' => $this->accountId,
            'name' => 'Test Organizer',
            'email' => 'organizer-'.uniqid().'@test.com',
            'currency' => 'USD',
            'timezone' => 'UTC',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function makeImage(int $organizerId, string $type): int
    {
        return DB::table('images')->insertGetId([
            'account_id' => $this->accountId,
            'entity_id' => $organizerId,
            'entity_type' => OrganizerDomainObject::class,
            'type' => $type,
            'filename' => 'photo.png',
            'disk' => 'local',
            'path' => 'photo.png',
            'size' => 100,
            'mime_type' => 'image/png',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
