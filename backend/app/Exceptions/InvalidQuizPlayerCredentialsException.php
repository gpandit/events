<?php

namespace HiEvents\Exceptions;

use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class InvalidQuizPlayerCredentialsException extends UnauthorizedHttpException
{
    public function __construct(string $message = 'Username or password is incorrect')
    {
        parent::__construct('QuizPlayer', $message);
    }
}
