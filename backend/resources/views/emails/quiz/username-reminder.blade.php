@php /** @var string[] $usernames */ @endphp
@php /** @var string $organizerName */ @endphp

<x-mail::message>
# {{ __('Your puzzle username') }}

{{ trans_choice('Someone asked for the :organizer puzzles username saved with this email address. Here it is:|Someone asked for the :organizer puzzles usernames saved with this email address. Here they are:', count($usernames), ['organizer' => $organizerName]) }}

@foreach ($usernames as $username)
- **{{ $username }}**
@endforeach

{{ __('Use it to sign in. If you have forgotten your password, choose "Forgot your password?" on the sign in page.') }}

{{ __('If you did not ask for this, you can ignore this email.') }}

{{ __('Thank you') }}
</x-mail::message>
