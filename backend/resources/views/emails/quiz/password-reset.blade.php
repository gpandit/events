@php /** @var string $username */ @endphp
@php /** @var string $organizerName */ @endphp
@php /** @var string $resetUrl */ @endphp

<x-mail::message>
# {{ __('Reset your password') }}

{{ __('Someone asked to reset the password for the :organizer puzzles username :username.', ['organizer' => $organizerName, 'username' => $username]) }}

<x-mail::button :url="$resetUrl">
{{ __('Choose a new password') }}
</x-mail::button>

{{ __('This link will expire in 60 minutes.') }}

{{ __('If you did not ask for this, you can ignore this email and your password will stay the same.') }}

{{ __('Thank you') }}
</x-mail::message>
