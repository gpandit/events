<?php

namespace HiEvents\Exceptions;

use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class InvalidCredentialsException extends UnauthorizedHttpException
{
    public function __construct(string $message = 'Username or password is incorrect')
    {
        parent::__construct('Credentials', $message);
    }
}
