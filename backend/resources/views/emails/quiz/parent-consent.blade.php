@php /** @var string $childFirstName */ @endphp
@php /** @var string $username */ @endphp
@php /** @var string $ageGroup */ @endphp
@php /** @var string $organizerName */ @endphp
@php /** @var string $consentUrl */ @endphp
@php /** @var int $validDays */ @endphp

<x-mail::message>
# {{ __('Your permission is needed') }}

{{ __(':child (age group :group) has created a puzzles account with :organizer and been given the username :username.', ['child' => $childFirstName, 'group' => $ageGroup, 'organizer' => $organizerName, 'username' => $username]) }}

**{{ __('If you agree, the public leaderboard will show only:') }}**

- {{ __('The auto-generated username (:username) - never their real name', ['username' => $username]) }}
- {{ __('Their points, number of tests taken and best score') }}

{{ __('Without your permission your child can still play and save their scores, but they will not appear on the leaderboard.') }}

<x-mail::button :url="$consentUrl">
{{ __('Review and respond') }}
</x-mail::button>

{{ __('This link will expire in :days days. We keep your email address only to record your response.', ['days' => $validDays]) }}

{{ __('If you were not expecting this email, you can ignore it.') }}

{{ __('Thank you') }}
</x-mail::message>
