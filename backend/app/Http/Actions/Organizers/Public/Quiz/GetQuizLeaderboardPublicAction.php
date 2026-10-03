<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Quiz;

use HiEvents\DomainObjects\Enums\QuizAgeBand;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\Quiz\GetQuizLeaderboardHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class GetQuizLeaderboardPublicAction extends BaseAction
{
    public function __construct(
        private readonly GetQuizLeaderboardHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $data = $this->validate($request, [
            'age_band' => ['required', Rule::in(QuizAgeBand::valuesArray())],
        ]);

        return $this->jsonResponse(
            $this->handler->handle($organizerId, $data['age_band'])->all(),
            wrapInData: true,
        );
    }
}
