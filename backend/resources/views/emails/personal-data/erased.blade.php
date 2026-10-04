@php /** @var \HiEvents\Services\Domain\PersonalData\DTO\PersonalDataErasureReportDTO $report */ @endphp
@php /** @var string $supportEmail */ @endphp

<x-mail::message>
# {{ __('Your personal data has been deleted') }}

{{ __('As you asked, we deleted the personal information we held for this email address on :date (UTC). This email is your confirmation and a record of what was and was not deleted. We did not keep a copy of your email address after sending it.', ['date' => $report->erased_at]) }}

## {{ __('What we deleted') }}

- {{ __('Your name, email address, phone number, address and notes on :count order(s) and the tickets attached to them', ['count' => count($report->order_references)]) }}
- {{ __('The names and email addresses on :count ticket holder record(s)', ['count' => $report->attendees_count]) }}
- {{ __('Your answers to event questions, the details and IP addresses in order change logs, and IP addresses recorded at check-in') }}
- {{ __(':count account(s) you created to sign in and view your tickets, and the links we emailed you for viewing tickets', ['count' => $report->customer_accounts_count]) }}
- {{ __(':count waitlist entr(ies) and our copy of :count2 payment customer record(s) (name and email only)', ['count' => $report->waitlist_entries_count, 'count2' => $report->payment_customer_records_count]) }}
- {{ __(':count children\'s stories or poems and :count2 children\'s puzzle account(s), including their scores, leaderboard entries and the parental permission records', ['count' => $report->stories_count, 'count2' => $report->puzzle_accounts_count]) }}

## {{ __('What we kept, and why') }}

{{ __('We are required to keep financial records for accounting, tax and audit purposes. We kept the payment record of each order without any personal details: the order reference, event, amounts, taxes, fees, currency, dates, status, and the payment processor references. These can no longer be linked to your name or email by us.') }}

@if (count($report->order_references) > 0)
{{ __('The orders affected are:') }} {{ implode(', ', array_map(fn ($reference) => '#'.$reference, $report->order_references)) }}

{{ __('Keep this email if you may need to refer to these order references later, for example to query a charge with your bank.') }}
@endif

{{ __('We also keep a minimal log that this deletion happened. It contains the order references above, the counts shown here, the date, and a one-way code derived from your email address, but not the email address itself.') }}

## {{ __('What is outside our control') }}

- **{{ __('Stripe (our payment processor)') }}**: {{ __('Stripe holds its own records of your payments, including card details, billing details and fraud-prevention data, under its own legal obligations. We cannot delete these. To make a request about them, contact Stripe or read its privacy policy at https://stripe.com/privacy.') }}
- **{{ __('Your bank and card network') }}**: {{ __('They keep records of the transactions on your statements.') }}
- **{{ __('Event organizers') }}**: {{ __('If an organizer already exported or received your details (for example an attendee list), they hold their own copy. Please contact them directly.') }}
- **{{ __('Emails already sent') }}**: {{ __('Copies of emails we sent you, such as tickets and receipts, remain in your own mailbox and with your email provider.') }}
- **{{ __('Backups') }}**: {{ __('Backups made before today may still contain your information until they expire in the normal course. We do not restore deleted personal information from them.') }}
- **{{ __('Analytics') }}**: {{ __('If you accepted analytics cookies, Google Analytics may hold anonymous usage data that we cannot link back to you. You can clear cookies in your browser and change your choice with the "Cookie settings" link in the website footer.') }}

## {{ __('Questions or did not ask for this?') }}

{{ __('If you did not ask for this deletion, or you have any questions, please contact us right away at :email.', ['email' => $supportEmail]) }}

{{ __('Thank you') }}
</x-mail::message>
