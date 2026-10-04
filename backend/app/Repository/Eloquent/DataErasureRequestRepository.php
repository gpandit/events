<?php

declare(strict_types=1);

namespace HiEvents\Repository\Eloquent;

use HiEvents\DomainObjects\DataErasureRequestDomainObject;
use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\Enums\PasswordSetupSubject;
use HiEvents\Models\DataErasureRequest;
use HiEvents\Repository\Interfaces\DataErasureRequestRepositoryInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Carbon;

/**
 * @extends BaseRepository<DataErasureRequestDomainObject>
 */
class DataErasureRequestRepository extends BaseRepository implements DataErasureRequestRepositoryInterface
{
    public const ERASED_EMAIL_DOMAIN = 'erased.invalid';

    protected function getModel(): string
    {
        return DataErasureRequest::class;
    }

    public function getDomainObject(): string
    {
        return DataErasureRequestDomainObject::class;
    }

    public function anonymiseOrders(string $email): array
    {
        return $this->runQuery(function () use ($email) {
            $orders = $this->db->table('orders')->whereRaw('LOWER(email) = ?', [$email]);

            $orderIds = (clone $orders)->pluck('id')->map(fn ($id) => (int) $id)->all();

            $orders->update([
                'first_name' => null,
                'last_name' => null,
                'email' => null,
                'phone' => null,
                'address' => null,
                'notes' => null,
                'opted_into_marketing_at' => null,
                'pii_erased_at' => Carbon::now(),
            ]);

            return $orderIds;
        });
    }

    public function anonymiseAttendees(string $email, array $orderIds): int
    {
        return $this->runQuery(function () use ($email, $orderIds) {
            $attendees = $this->db->table('attendees')->where(
                fn (Builder $query) => $query
                    ->whereRaw('LOWER(email) = ?', [$email])
                    ->orWhereIn('order_id', $orderIds)
            );

            $count = (clone $attendees)->count();

            $attendees->update([
                'first_name' => '',
                'last_name' => '',
                'email' => $this->db->raw("'erased-' || id || '@".self::ERASED_EMAIL_DOMAIN."'"),
                'notes' => null,
            ]);

            return $count;
        });
    }

    public function scrubOrderRelatedRecords(array $orderIds): void
    {
        $this->runQuery(function () use ($orderIds) {
            $this->db->table('question_answers')
                ->whereIn('order_id', $orderIds)
                ->update(['answer' => null]);

            $this->db->table('order_audit_logs')
                ->whereIn('order_id', $orderIds)
                ->update([
                    'old_values' => null,
                    'new_values' => null,
                    'changed_fields' => null,
                    'ip_address' => null,
                    'user_agent' => null,
                ]);

            $this->db->table('attendee_check_ins')
                ->whereIn('order_id', $orderIds)
                ->update(['ip_address' => '0.0.0.0']);
        });
    }

    public function anonymiseWaitlistEntries(string $email): void
    {
        $this->runQuery(function () use ($email) {
            $this->db->table('waitlist_entries')
                ->whereRaw('LOWER(email) = ?', [$email])
                ->update([
                    'first_name' => '',
                    'last_name' => null,
                    'email' => $this->db->raw("'erased-' || id || '@".self::ERASED_EMAIL_DOMAIN."'"),
                    'offer_token' => null,
                    'cancel_token' => null,
                ]);
        });
    }

    public function anonymiseStripeCustomers(string $email): void
    {
        $this->runQuery(function () use ($email) {
            $this->db->table('stripe_customers')
                ->whereRaw('LOWER(email) = ?', [$email])
                ->update([
                    'name' => '',
                    'email' => $this->db->raw("'erased-' || id || '@".self::ERASED_EMAIL_DOMAIN."'"),
                ]);
        });
    }

    public function deleteCustomerAccounts(string $email): void
    {
        $this->runQuery(function () use ($email) {
            $customers = $this->db->table('customers')->whereRaw('LOWER(email) = ?', [$email]);

            $this->db->table('password_setup_tokens')
                ->where('subject_type', PasswordSetupSubject::CUSTOMER->value)
                ->whereIn('subject_id', (clone $customers)->select('id'))
                ->delete();

            $customers->delete();
        });
    }

    public function deleteTicketLookupTokens(string $email): void
    {
        $this->runQuery(function () use ($email) {
            $this->db->table('ticket_lookup_tokens')->whereRaw('LOWER(email) = ?', [$email])->delete();
        });
    }

    public function deleteChildRecords(string $email): int
    {
        return $this->runQuery(function () use ($email) {
            $consents = $this->db->table('parental_consents')->whereRaw('LOWER(parent_email) = ?', [$email]);

            $storyIds = (clone $consents)
                ->where('subject_type', ParentalConsentSubject::CHILD_STORY->value)
                ->pluck('subject_id');

            $playerIds = (clone $consents)
                ->where('subject_type', ParentalConsentSubject::QUIZ_PLAYER->value)
                ->pluck('subject_id')
                ->merge($this->db->table('quiz_players')->whereRaw('LOWER(email) = ?', [$email])->pluck('id'))
                ->unique()
                ->values();

            $this->db->table('child_story_submissions')->whereIn('id', $storyIds)->delete();

            $this->db->table('password_setup_tokens')
                ->where('subject_type', PasswordSetupSubject::QUIZ_PLAYER->value)
                ->whereIn('subject_id', $playerIds)
                ->delete();
            $this->db->table('quiz_players')->whereIn('id', $playerIds)->delete();

            $this->db->table('parental_consents')
                ->where(fn (Builder $query) => $query
                    ->where(fn (Builder $inner) => $inner
                        ->where('subject_type', ParentalConsentSubject::CHILD_STORY->value)
                        ->whereIn('subject_id', $storyIds))
                    ->orWhere(fn (Builder $inner) => $inner
                        ->where('subject_type', ParentalConsentSubject::QUIZ_PLAYER->value)
                        ->whereIn('subject_id', $playerIds)))
                ->delete();

            return $storyIds->count() + $playerIds->count();
        });
    }
}
