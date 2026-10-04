<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Quiz;

use HiEvents\Exceptions\QuizUsernameUnavailableException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\ResponseCodes;
use HiEvents\Services\Domain\Quiz\QuizUsernameGenerator;
use Illuminate\Http\JsonResponse;

class GetQuizUsernameOptionsPublicAction extends BaseAction
{
    public function __construct(
        private readonly QuizUsernameGenerator $usernameGenerator,
    ) {}

    public function __invoke(int $organizerId): JsonResponse
    {
        try {
            $options = $this->usernameGenerator->generateOptions($organizerId);
        } catch (QuizUsernameUnavailableException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_SERVICE_UNAVAILABLE);
        }

        return $this->jsonResponse($options, wrapInData: true);
    }
}
