@php /** @var \HiEvents\DomainObjects\OrderDomainObject $order */ @endphp
@php /** @var \HiEvents\DomainObjects\OrganizerDomainObject $organizer */ @endphp
@php /** @var \HiEvents\DomainObjects\EventDomainObject $event */ @endphp
@php /** @var \HiEvents\DomainObjects\EventSettingDomainObject $eventSettings */ @endphp
@php /** @var string $studentName */ @endphp

@php /** @see \HiEvents\Mail\Order\OrderReadyForCollectionEmail */ @endphp

<x-mail::message>
{{ __('Hello') }} {{ $order->getFirstName() }},

{{ __('Your order from') }} <b>{{ $event->getTitle() }}</b> {{ __('is ready for collection from school reception.') }}
<br>
<br>
{{ __('Collection for:') }} <b>{{ $studentName }}</b>
<br>
{{ __('Order #:') }} <b>{{ $order->getPublicId() }}</b>
<br>
<br>
{{ __('Please quote the student name or order number at reception.') }}
<br><br>
{{ __('Thank you') }},<br>
{{ $organizer->getName() ?: config('app.name') }}

{!! $eventSettings->getGetEmailFooterHtml() !!}
</x-mail::message>
