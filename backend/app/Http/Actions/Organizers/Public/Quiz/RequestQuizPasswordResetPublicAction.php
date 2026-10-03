<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Quiz;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RequestQuizPasswordResetDTO;
use HiEvents\Services\Application\Handlers\Quiz\RequestQuizPasswordResetHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RequestQuizPasswordResetPublicAction extends BaseAction
{
    public function __construct(
        private readonly RequestQuizPasswordResetHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $data = $this->validate($request, [
            'username' => 'required|string|max:60',
        ]);

        $this->handler->handle(RequestQuizPasswordResetDTO::from([
            'organizer_id' => $organizerId,
            'username' => $data['username'],
        ]));

        return $this->jsonResponse([
            'message' => __('If that username has an email address saved, we have sent a link to reset the password.'),
        ]);
    }
}
