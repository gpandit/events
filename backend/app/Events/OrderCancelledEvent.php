<?php

namespace HiEvents\Events;

readonly class OrderCancelledEvent
{
    public function __construct(
        public int $eventId,
        public int $orderId,
    ) {}
}
