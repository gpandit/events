<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Quiz;

use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\Exceptions\InvalidQuizPlayerTokenException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use Illuminate\Http\Request;

abstract class BaseQuizPlayerAction extends BaseAction
{
    public function __construct(
        protected readonly QuizPlayerSessionService $sessionService,
    ) {}

    /**
     * @throws InvalidQuizPlayerTokenException
     */
    protected function authenticatedPlayer(Request $request, int $organizerId): QuizPlayerDomainObject
    {
        return $this->sessionService->authenticate($request->header('X-Quiz-Token'), $organizerId);
    }
}
