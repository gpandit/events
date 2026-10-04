@php /** @var string $childFirstName */ @endphp
@php /** @var string $childLastInitial */ @endphp
@php /** @var string $workType */ @endphp
@php /** @var string $yearGroup */ @endphp
@php /** @var string $submittedOn */ @endphp
@php /** @var string $organizerName */ @endphp
@php /** @var string $consentUrl */ @endphp
@php /** @var int $validDays */ @endphp

<x-mail::message>
# {{ __('Your permission is needed') }}

{{ __(':child has submitted a :type to :organizer and would like it to be published on our public website.', ['child' => $childFirstName, 'type' => $workType, 'organizer' => $organizerName]) }}

{{ __('Because :child is under 16, we can only publish their work with your permission.', ['child' => $childFirstName]) }}

**{{ __('If you agree and our team approves the work, the following will be shown publicly below its headline:') }}**

- {{ __('Their first name and the initial of their last name (:name)', ['name' => $childFirstName.' '.$childLastInitial.'.']) }}
- {{ __('Their class / year group (:group)', ['group' => $yearGroup]) }}
- {{ __('The date it was submitted (:date)', ['date' => $submittedOn]) }}
- {{ __('The full text of the work') }}

{{ __('Nothing is published unless you agree. You can read the full work and give or decline permission using the button below.') }}

<x-mail::button :url="$consentUrl">
{{ __('Review and respond') }}
</x-mail::button>

{{ __('This link will expire in :days days. We keep your email address only to record your response.', ['days' => $validDays]) }}

{{ __('If you were not expecting this email, you can ignore it and nothing will be published.') }}

{{ __('Thank you') }}
</x-mail::message>
