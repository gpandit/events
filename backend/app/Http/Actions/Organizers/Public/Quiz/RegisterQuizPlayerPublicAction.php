<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Quiz;

use HiEvents\DomainObjects\Enums\QuizAgeBand;
use HiEvents\Exceptions\QuizUsernameUnavailableException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\ResponseCodes;
use HiEvents\Services\Application\Handlers\Quiz\DTO\RegisterQuizPlayerDTO;
use HiEvents\Services\Application\Handlers\Quiz\RegisterQuizPlayerHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
            'email' => 'required|email|max:255',
            'age_band' => ['required', Rule::enum(QuizAgeBand::class)],
            'parent_email' => [
                Rule::requiredIf(fn () => QuizAgeBand::tryFrom((string) $request->input('age_band'))?->requiresParentalConsent() ?? false),
                'nullable',
                'email',
                'max:255',
                'different:email',
            ],
            'password' => 'required|string|min:6|max:100',
        ]);

        try {
            $session = $this->handler->handle(RegisterQuizPlayerDTO::from([
                'organizer_id' => $organizerId,
                'first_name' => $data['first_name'],
                'email' => $data['email'],
                'age_band' => $data['age_band'],
                'parent_email' => $data['parent_email'] ?? null,
                'password' => $data['password'],
            ]));
        } catch (QuizUsernameUnavailableException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_SERVICE_UNAVAILABLE);
        }

        return $this->jsonResponse($session->toArray(), ResponseCodes::HTTP_CREATED, wrapInData: true);
    }
}
