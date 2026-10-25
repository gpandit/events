<?php

namespace Tests\Feature\Http\Actions\ColouringPages;

use HiEvents\Http\ResponseCodes;
use HiEvents\Models\AccountConfiguration;
use HiEvents\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class SharedColouringPagesTest extends TestCase
{
    use DatabaseTransactions;

    private string $schoolAdminToken;

    private string $schoolOrganizerToken;

    private string $platformAdminToken;

    private string $otherSchoolAdminToken;

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

        Storage::fake('local');
        DB::table('colouring_pages')->whereNull('organizer_id')->delete();

        [$this->schoolAdminToken, $accountId] = $this->makeUser('ADMIN');
        $this->organizerId = $this->makeOrganizer($accountId);
        $this->schoolOrganizerToken = $this->makeUserInAccount($accountId, 'ORGANIZER');

        [$this->otherSchoolAdminToken, $otherAccountId] = $this->makeUser('ADMIN');
        $this->otherOrganizerId = $this->makeOrganizer($otherAccountId);

        [$this->platformAdminToken] = $this->makeUser('SUPERADMIN');
    }

    public function test_a_school_admin_sees_its_own_pages_and_the_shared_library_but_not_another_schools(): void
    {
        $this->makePage($this->organizerId, 'Own page');
        $this->makePage(null, 'Shared page');
        $this->makePage($this->otherOrganizerId, 'Other school page');

        $response = $this->getJson("/organizers/{$this->organizerId}/colouring-pages", $this->headers($this->schoolAdminToken));

        $response->assertStatus(ResponseCodes::HTTP_OK);
        $this->assertSame(['Own page', 'Shared page'], collect($response->json('data'))->pluck('title')->all());
        $this->assertSame([false, true], collect($response->json('data'))->pluck('is_shared')->all());
    }

    public function test_the_public_page_lists_published_pages_from_the_school_and_the_shared_library(): void
    {
        $this->makePage($this->organizerId, 'Own published');
        $this->makePage($this->organizerId, 'Own draft', 'DRAFT');
        $this->makePage(null, 'Shared published');
        $this->makePage(null, 'Shared draft', 'DRAFT');
        $this->makePage($this->otherOrganizerId, 'Other school page');

        $response = $this->getJson("/public/organizers/{$this->organizerId}/colouring-pages");

        $response->assertStatus(ResponseCodes::HTTP_OK);
        $this->assertSame(['Own published', 'Shared published'], collect($response->json('data'))->pluck('title')->all());
    }

    public function test_a_school_admin_can_update_its_own_page(): void
    {
        $pageId = $this->makePage($this->organizerId, 'Own page');

        $this->putJson(
            "/organizers/{$this->organizerId}/colouring-pages/{$pageId}",
            $this->details('Renamed'),
            $this->headers($this->schoolAdminToken),
        )->assertStatus(ResponseCodes::HTTP_OK)->assertJsonPath('data.title', 'Renamed');
    }

    public function test_a_school_admin_cannot_change_or_delete_a_shared_page(): void
    {
        $sharedId = $this->makePage(null, 'Shared page');

        $this->putJson(
            "/organizers/{$this->organizerId}/colouring-pages/{$sharedId}",
            $this->details('Hijacked'),
            $this->headers($this->schoolAdminToken),
        )->assertStatus(ResponseCodes::HTTP_NOT_FOUND);

        $this->deleteJson(
            "/organizers/{$this->organizerId}/colouring-pages/{$sharedId}",
            [],
            $this->headers($this->schoolAdminToken),
        )->assertStatus(ResponseCodes::HTTP_NOT_FOUND);

        $this->putJson(
            "/organizers/{$this->organizerId}/colouring-pages/order",
            ['page_ids' => [$sharedId]],
            $this->headers($this->schoolAdminToken),
        )->assertStatus(ResponseCodes::HTTP_NOT_FOUND);

        $this->assertSame('Shared page', DB::table('colouring_pages')->where('id', $sharedId)->value('title'));
    }

    public function test_a_school_admin_cannot_manage_another_schools_pages(): void
    {
        $pageId = $this->makePage($this->otherOrganizerId, 'Other school page');

        $this->putJson(
            "/organizers/{$this->otherOrganizerId}/colouring-pages/{$pageId}",
            $this->details('Hijacked'),
            $this->headers($this->schoolAdminToken),
        )->assertStatus(ResponseCodes::HTTP_FORBIDDEN);
    }

    public function test_an_organizer_role_user_can_view_but_not_change_colouring_pages(): void
    {
        $pageId = $this->makePage($this->organizerId, 'Own page');

        $this->getJson("/organizers/{$this->organizerId}/colouring-pages", $this->headers($this->schoolOrganizerToken))
            ->assertStatus(ResponseCodes::HTTP_OK);

        $this->putJson(
            "/organizers/{$this->organizerId}/colouring-pages/{$pageId}",
            $this->details('Renamed'),
            $this->headers($this->schoolOrganizerToken),
        )->assertStatus(ResponseCodes::HTTP_FORBIDDEN);

        $this->deleteJson(
            "/organizers/{$this->organizerId}/colouring-pages/{$pageId}",
            [],
            $this->headers($this->schoolOrganizerToken),
        )->assertStatus(ResponseCodes::HTTP_FORBIDDEN);

        $this->post(
            "/organizers/{$this->organizerId}/colouring-pages",
            $this->details('New') + $this->files(),
            $this->headers($this->schoolOrganizerToken),
        )->assertStatus(ResponseCodes::HTTP_FORBIDDEN);
    }

    public function test_a_school_admin_can_upload_a_page_for_its_school(): void
    {
        $response = $this->post(
            "/organizers/{$this->organizerId}/colouring-pages",
            $this->details('Uploaded') + $this->files(),
            $this->headers($this->schoolAdminToken),
        );

        $response->assertStatus(ResponseCodes::HTTP_CREATED);
        $this->assertSame($this->organizerId, DB::table('colouring_pages')->where('title', 'Uploaded')->value('organizer_id'));
    }

    public function test_only_a_platform_admin_can_use_the_shared_library_endpoints(): void
    {
        $this->getJson('/admin/colouring-pages', $this->headers($this->schoolAdminToken))
            ->assertStatus(ResponseCodes::HTTP_FORBIDDEN);
        $this->post('/admin/colouring-pages', $this->details('New') + $this->files(), $this->headers($this->schoolAdminToken))
            ->assertStatus(ResponseCodes::HTTP_FORBIDDEN);
    }

    public function test_a_platform_admin_manages_the_shared_library(): void
    {
        $this->makePage($this->organizerId, 'School page');

        $create = $this->post('/admin/colouring-pages', $this->details('Library page') + $this->files(), $this->headers($this->platformAdminToken));
        $create->assertStatus(ResponseCodes::HTTP_CREATED)->assertJsonPath('data.is_shared', true);
        $pageId = $create->json('data.id');

        $list = $this->getJson('/admin/colouring-pages', $this->headers($this->platformAdminToken));
        $this->assertSame(['Library page'], collect($list->json('data'))->pluck('title')->all());

        $this->putJson("/admin/colouring-pages/{$pageId}", $this->details('Renamed library page'), $this->headers($this->platformAdminToken))
            ->assertStatus(ResponseCodes::HTTP_OK)
            ->assertJsonPath('data.title', 'Renamed library page');

        $this->getJson("/public/organizers/{$this->otherOrganizerId}/colouring-pages")
            ->assertJsonPath('data.0.title', 'Renamed library page');

        $this->deleteJson("/admin/colouring-pages/{$pageId}", [], $this->headers($this->platformAdminToken))
            ->assertStatus(ResponseCodes::HTTP_NO_CONTENT);
        $this->assertSame(0, DB::table('colouring_pages')->whereNull('organizer_id')->count());
    }

    public function test_a_platform_admin_cannot_reorder_or_change_a_school_page_through_the_library_endpoints(): void
    {
        $schoolPageId = $this->makePage($this->organizerId, 'School page');

        $this->putJson("/admin/colouring-pages/{$schoolPageId}", $this->details('Hijacked'), $this->headers($this->platformAdminToken))
            ->assertStatus(ResponseCodes::HTTP_NOT_FOUND);
        $this->deleteJson("/admin/colouring-pages/{$schoolPageId}", [], $this->headers($this->platformAdminToken))
            ->assertStatus(ResponseCodes::HTTP_NOT_FOUND);
        $this->putJson('/admin/colouring-pages/order', ['page_ids' => [$schoolPageId]], $this->headers($this->platformAdminToken))
            ->assertStatus(ResponseCodes::HTTP_NOT_FOUND);
    }

    private function details(string $title): array
    {
        return ['title' => $title, 'age_group' => 'AGE_6_10', 'tint' => 'MINT', 'status' => 'PUBLISHED'];
    }

    private function files(): array
    {
        return [
            'pdf' => UploadedFile::fake()->createWithContent('page.pdf', "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"),
            'thumbnail' => UploadedFile::fake()->image('thumbnail.png', 20, 20),
        ];
    }

    private function makePage(?int $organizerId, string $title, string $status = 'PUBLISHED'): int
    {
        return DB::table('colouring_pages')->insertGetId([
            'organizer_id' => $organizerId,
            'title' => $title,
            'age_group' => 'AGE_6_10',
            'tint' => 'MINT',
            'pdf_path' => '/pdf/'.uniqid().'.pdf',
            'thumbnail_path' => '/pdf-thumbnails/'.uniqid().'.png',
            'status' => $status,
            'sort_order' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function makeUser(string $role): array
    {
        $user = User::factory()->withAccount()->create();
        $accountId = $user->accounts()->first()->id;

        DB::table('account_users')->where('user_id', $user->id)->update(['role' => $role]);

        return [JWTAuth::claims(['account_id' => $accountId])->fromUser($user), $accountId];
    }

    private function makeUserInAccount(int $accountId, string $role): string
    {
        $user = User::factory()->create();

        DB::table('account_users')->insert([
            'account_id' => $accountId,
            'user_id' => $user->id,
            'role' => $role,
            'status' => 'ACTIVE',
            'is_account_owner' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return JWTAuth::claims(['account_id' => $accountId])->fromUser($user);
    }

    private function makeOrganizer(int $accountId): int
    {
        return DB::table('organizers')->insertGetId([
            'account_id' => $accountId,
            'name' => 'Test Organizer',
            'email' => 'organizer-'.uniqid().'@test.com',
            'currency' => 'USD',
            'timezone' => 'UTC',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function headers(string $token): array
    {
        $this->app['auth']->forgetGuards();
        $this->app['tymon.jwt']->unsetToken();

        return ['Authorization' => "Bearer $token", 'Accept' => 'application/json'];
    }
}
