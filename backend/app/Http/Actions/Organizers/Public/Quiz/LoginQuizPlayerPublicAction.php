<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Quiz;

use HiEvents\Exceptions\InvalidQuizPlayerCredentialsException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\ResponseCodes;
use HiEvents\Services\Application\Handlers\Quiz\DTO\LoginQuizPlayerDTO;
use HiEvents\Services\Application\Handlers\Quiz\LoginQuizPlayerHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LoginQuizPlayerPublicAction extends BaseAction
{
    public function __construct(
        private readonly LoginQuizPlayerHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $data = $this->validate($request, [
            'username' => 'required|string|max:60',
            'password' => 'required|string|max:100',
        ]);

        try {
            $session = $this->handler->handle(LoginQuizPlayerDTO::from([
                'organizer_id' => $organizerId,
                'username' => $data['username'],
                'password' => $data['password'],
            ]));
        } catch (InvalidQuizPlayerCredentialsException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_UNAUTHORIZED);
        }

        return $this->jsonResponse($session->toArray(), wrapInData: true);
    }
}
