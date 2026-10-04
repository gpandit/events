<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Quiz;

use HiEvents\Exceptions\InvalidQuizPlayerTokenException;
use HiEvents\Http\ResponseCodes;
use HiEvents\Resources\Quiz\QuizResultResource;
use HiEvents\Services\Application\Handlers\Quiz\GetQuizPlayerProfileHandler;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetQuizPlayerProfilePublicAction extends BaseQuizPlayerAction
{
    public function __construct(
        QuizPlayerSessionService $sessionService,
        private readonly GetQuizPlayerProfileHandler $handler,
    ) {
        parent::__construct($sessionService);
    }

    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        try {
            $player = $this->authenticatedPlayer($request, $organizerId);
        } catch (InvalidQuizPlayerTokenException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_UNAUTHORIZED);
        }

        $profile = $this->handler->handle($player);

        return $this->jsonResponse([
            'username' => $profile->username,
            'totals' => $profile->totals->map(fn ($totals) => $totals->toArray())->values(),
            'results' => QuizResultResource::collection($profile->results)->resolve($request),
        ], wrapInData: true);
    }
}
