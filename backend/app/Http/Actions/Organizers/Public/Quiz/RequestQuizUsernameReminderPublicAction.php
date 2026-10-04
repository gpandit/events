<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Quiz;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RequestQuizUsernameReminderDTO;
use HiEvents\Services\Application\Handlers\Quiz\RequestQuizUsernameReminderHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RequestQuizUsernameReminderPublicAction extends BaseAction
{
    public function __construct(
        private readonly RequestQuizUsernameReminderHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $data = $this->validate($request, [
            'email' => 'required|email|max:255',
        ]);

        $this->handler->handle(RequestQuizUsernameReminderDTO::from([
            'organizer_id' => $organizerId,
            'email' => $data['email'],
        ]));

        return $this->jsonResponse([
            'message' => __('If that email address is registered, we have sent the username to it.'),
        ]);
    }
}
