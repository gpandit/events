<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Quiz;

use HiEvents\Exceptions\QuizUsernameUnavailableException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\ResponseCodes;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RegisterQuizPlayerDTO;
use HiEvents\Services\Application\Handlers\Quiz\RegisterQuizPlayerHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RegisterQuizPlayerPublicAction extends BaseAction
{
    public function __construct(
        private readonly RegisterQuizPlayerHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $request->merge(['organizer_id' => $organizerId]);

        $data = $this->validate($request, [
            'organizer_id' => 'required|exists:organizers,id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6|max:100',
        ]);

        try {
            $session = $this->handler->handle(RegisterQuizPlayerDTO::from([
                'organizer_id' => $organizerId,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]));
        } catch (QuizUsernameUnavailableException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_SERVICE_UNAVAILABLE);
        }

        return $this->jsonResponse($session->toArray(), ResponseCodes::HTTP_CREATED, wrapInData: true);
    }
}
