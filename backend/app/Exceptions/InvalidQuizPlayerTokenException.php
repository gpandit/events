<?php

namespace HiEvents\Exceptions;

use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class InvalidQuizPlayerTokenException extends UnauthorizedHttpException
{
    public function __construct(string $message = 'Please sign in to continue')
    {
        parent::__construct('QuizPlayer', $message);
    }
}
