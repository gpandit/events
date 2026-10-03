<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Quiz;

use HiEvents\DomainObjects\Enums\QuizAgeBand;
use HiEvents\Exceptions\InvalidQuizPlayerTokenException;
use HiEvents\Http\ResponseCodes;
use HiEvents\Services\Application\Handlers\Quiz\DTO\SubmitQuizResultDTO;
use HiEvents\Services\Application\Handlers\Quiz\SubmitQuizResultHandler;
use HiEvents\Services\Domain\Quiz\QuizPlayerSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SubmitQuizResultPublicAction extends BaseQuizPlayerAction
{
    public function __construct(
        QuizPlayerSessionService $sessionService,
        private readonly SubmitQuizResultHandler $handler,
    ) {
        parent::__construct($sessionService);
    }

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        try {
            $player = $this->authenticatedPlayer($request, $organizerId);
        } catch (InvalidQuizPlayerTokenException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_UNAUTHORIZED);
        }

        $data = $this->validate($request, [
            'age_band' => ['required', Rule::in(QuizAgeBand::valuesArray())],
            'score' => 'required|integer|min:0|lte:total_questions',
            'total_questions' => 'required|integer|min:1|max:100',
        ]);

        $outcome = $this->handler->handle(SubmitQuizResultDTO::from([
            'player' => $player,
            'age_band' => $data['age_band'],
            'score' => (int) $data['score'],
            'total_questions' => (int) $data['total_questions'],
        ]));

        return $this->jsonResponse($outcome->toArray(), wrapInData: true);
    }
}
