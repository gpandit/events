@php /** @var string $firstName */ @endphp
@php /** @var string $lastName */ @endphp
@php /** @var string $email */ @endphp
@php /** @var string $phone */ @endphp
@php /** @var string|null $messageContent */ @endphp
@php /** @var string $replySubject */ @endphp

@php /** @see \HiEvents\Mail\VolunteerSignupEmail */ @endphp

<x-mail::message>
{{ __('You have received a new volunteer sign-up.') }}

**{{ __('Name') }}:** {{ $firstName }} {{ $lastName }}

**{{ __('Email') }}:** {{ $email }}

**{{ __('Phone') }}:** {{ $phone }}

@if($messageContent)
<div style="border-radius: 5px; background-color: #eeeeee; margin: 10px 0; padding: 20px;">

{!! nl2br(e($messageContent)) !!}

</div>
@endif

<x-mail::button :url="'mailto:' . $email . '?subject=' . $replySubject">
{{ __('Reply to :name', ['name' => $firstName]) }}
</x-mail::button>
</x-mail::message>
