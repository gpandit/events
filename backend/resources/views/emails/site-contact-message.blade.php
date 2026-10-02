@php /** @var string $senderName */ @endphp
@php /** @var string $senderEmail */ @endphp
@php /** @var string $messageContent */ @endphp
@php /** @var string $replySubject */ @endphp

@php /** @see \HiEvents\Mail\SiteContactEmail */ @endphp

<x-mail::message>
{{ __('You have received a new message from') }} **{{ $senderName }}** ({{ $senderEmail }}).

<b>{{ __('This message was submitted through the website contact form and may contain spam, suspicious links or malicious content. Please exercise caution when opening links, downloading attachments or replying.') }}</b>

<div style="border-radius: 5px; background-color: #eeeeee; margin: 10px 0; padding: 20px;">

{!! nl2br(e($messageContent)) !!}

</div>

<x-mail::button :url="'mailto:' . $senderEmail . '?subject=' . $replySubject">
{{ __('Reply to :name', ['name' => $senderName]) }}
</x-mail::button>
</x-mail::message>
