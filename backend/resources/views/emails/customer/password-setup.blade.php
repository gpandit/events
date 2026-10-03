@php /** @var string $firstName */ @endphp
@php /** @var string $organizerName */ @endphp
@php /** @var string $setupUrl */ @endphp

<x-mail::message>
# {{ __('Set your password') }}

{{ __('Hello :name,', ['name' => $firstName]) }}

{{ __('Use the button below to choose a password for your :organizer account. Once you are signed in you can see your tickets and other purchases.', ['organizer' => $organizerName]) }}

<x-mail::button :url="$setupUrl">
{{ __('Choose my password') }}
</x-mail::button>

{{ __('This link will expire in 60 minutes.') }}

{{ __('If you did not request this, please ignore this email.') }}

{{ __('Thank you') }}
</x-mail::message>
