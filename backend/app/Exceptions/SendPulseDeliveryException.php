<?php

namespace HiEvents\Exceptions;

use Symfony\Component\Mailer\Exception\TransportException;

class SendPulseDeliveryException extends TransportException {}
