<?php

namespace Tests\Feature\Http\Actions\Customer;

use HiEvents\DomainObjects\OrderDomainObject;
use HiEvents\DomainObjects\Status\OrderStatus;
use HiEvents\Events\OrderStatusChangedEvent;
use HiEvents\Listeners\Order\UpsertCustomerListener;
use HiEvents\Mail\Customer\CustomerPasswordSetupEmail;
use HiEvents\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CustomerAccountFlowTest extends TestCase
{
    use DatabaseTransactions;

    private int $organizerId;

    private int $eventId;

    protected function setUp(): void
    {
        parent::setUp();

        $user = User::factory()->withAccount()->create();
        $accountId = $user->accounts()->first()->id;

        $this->organizerId = DB::table('organizers')->insertGetId([
            'account_id' => $accountId,
            'name' => 'Customer Organizer',
            'email' => 'organizer-'.uniqid().'@test.com',
            'currency' => 'USD',
            'timezone' => 'UTC',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->eventId = DB::table('events')->insertGetId([
            'title' => 'Summer Fair',
            'description' => '<p>Fun</p>',
            'category' => 'MUSIC',
            'account_id' => $accountId,
            'user_id' => $user->id,
            'organizer_id' => $this->organizerId,
            'status' => 'LIVE',
            'currency' => 'USD',
            'timezone' => 'UTC',
            'type' => 'SINGLE',
            'short_id' => 'ev_'.uniqid(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function url(string $path): string
    {
        return "/public/organizers/{$this->organizerId}/{$path}";
    }

    private function completeOrder(string $email, string $firstName, ?string $phone, string $status = 'COMPLETED'): void
    {
        $order = (new OrderDomainObject)
            ->setId(1)
            ->setEventId($this->eventId)
            ->setFirstName($firstName)
            ->setLastName('Parent')
            ->setEmail($email)
            ->setPhone($phone)
            ->setStatus($status);

        $this->app->make(UpsertCustomerListener::class)->handle(new OrderStatusChangedEvent($order, sendEmails: false));
    }

    private function capturedSetupUrl(): string
    {
        $url = null;

        Mail::assertQueued(CustomerPasswordSetupEmail::class, function (CustomerPasswordSetupEmail $mail) use (&$url) {
            $url = $mail->content()->with['setupUrl'];

            return true;
        });

        return $url;
    }

    private function tokenFrom(string $url): string
    {
        parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

        return $query['token'];
    }

    public function test_a_completed_order_adds_the_parent_to_the_crm_and_repeat_orders_do_not_duplicate(): void
    {
        $this->completeOrder('Parent@Example.com', 'Sam', '07123 456789');
        $this->completeOrder('parent@example.com', 'Sam', null);

        $this->assertDatabaseCount('customers', 1);
        $this->assertDatabaseHas('customers', [
            'organizer_id' => $this->organizerId,
            'email' => 'parent@example.com',
            'first_name' => 'Sam',
            'last_name' => 'Parent',
            'phone' => '07123 456789',
        ]);
    }

    public function test_orders_that_are_not_completed_are_not_added_to_the_crm(): void
    {
        $this->completeOrder('waiting@example.com', 'Wendy', null, OrderStatus::AWAITING_OFFLINE_PAYMENT->name);

        $this->assertDatabaseMissing('customers', ['email' => 'waiting@example.com']);
    }

    public function test_a_parent_creates_an_account_from_an_emailed_link_and_signs_in(): void
    {
        $this->completeOrder('parent@example.com', 'Sam', null);
        Mail::fake();

        $this->postJson($this->url('customers/register'), [
            'first_name' => 'Ignored',
            'last_name' => 'Ignored',
            'email' => 'parent@example.com',
        ])->assertOk();

        $this->assertDatabaseHas('customers', ['email' => 'parent@example.com', 'first_name' => 'Sam']);

        $token = $this->tokenFrom($this->capturedSetupUrl());

        $this->postJson($this->url('customers/set-password'), ['token' => $token, 'password' => 'a-long-password'])
            ->assertOk()
            ->assertJsonPath('data.first_name', 'Sam')
            ->assertJsonStructure(['data' => ['lookup_token']]);

        $this->postJson($this->url('customers/set-password'), ['token' => $token, 'password' => 'another-password'])
            ->assertUnprocessable();

        $login = $this->postJson($this->url('customers/login'), ['email' => 'PARENT@example.com', 'password' => 'a-long-password'])
            ->assertOk();

        $this->getJson('/public/ticket-lookup/'.$login->json('data.lookup_token'))->assertOk();

        $this->postJson($this->url('customers/login'), ['email' => 'parent@example.com', 'password' => 'wrong-password'])
            ->assertUnauthorized();
    }

    public function test_an_account_cannot_be_used_before_the_emailed_link_is_followed(): void
    {
        Mail::fake();

        $this->postJson($this->url('customers/register'), [
            'first_name' => 'New',
            'last_name' => 'Parent',
            'email' => 'new@example.com',
            'phone' => '0777',
        ])->assertOk();

        $this->assertDatabaseHas('customers', ['email' => 'new@example.com', 'phone' => '0777', 'password' => null]);

        $this->postJson($this->url('customers/login'), ['email' => 'new@example.com', 'password' => 'anything-at-all'])
            ->assertUnauthorized();
    }

    public function test_forgot_password_never_reveals_whether_an_account_exists(): void
    {
        Mail::fake();

        $this->postJson($this->url('customers/forgot-password'), ['email' => 'nobody@example.com'])->assertOk();

        Mail::assertNothingQueued();
    }

    public function test_a_setup_link_cannot_be_used_on_another_organizer(): void
    {
        $this->completeOrder('parent@example.com', 'Sam', null);
        Mail::fake();

        $this->postJson($this->url('customers/forgot-password'), ['email' => 'parent@example.com'])->assertOk();
        $token = $this->tokenFrom($this->capturedSetupUrl());

        $this->postJson('/public/organizers/999999/customers/set-password', ['token' => $token, 'password' => 'a-long-password'])
            ->assertUnprocessable();
    }
}
