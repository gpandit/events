<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public;

use HiEvents\DomainObjects\Enums\QuizAgeBand;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\QuizResult\DTO\SubmitQuizResultDTO;
use HiEvents\Services\Application\Handlers\QuizResult\SubmitQuizResultHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SubmitQuizResultPublicAction extends BaseAction
{
    public function __construct(
        private readonly SubmitQuizResultHandler $handler,
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
            'age_band' => ['required', Rule::in(QuizAgeBand::valuesArray())],
            'score' => 'required|integer|min:0|lte:total_questions',
            'total_questions' => 'required|integer|min:1|max:100',
        ]);

        $this->handler->handle(SubmitQuizResultDTO::from([
            'organizer_id' => $organizerId,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'age_band' => $data['age_band'],
            'score' => (int) $data['score'],
            'total_questions' => (int) $data['total_questions'],
        ]));

        return $this->jsonResponse([
            'message' => __('Your score has been saved.'),
        ]);
    }
}
