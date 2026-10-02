<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public;

use HiEvents\DomainObjects\Enums\ChildStorySubmissionType;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\ChildStorySubmission\ChildStorySubmissionResource;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\DTO\SubmitChildStorySubmissionDTO;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\SubmitChildStorySubmissionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SubmitChildStorySubmissionPublicAction extends BaseAction
{
    public function __construct(
        private readonly SubmitChildStorySubmissionHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $data = $this->validate($request, [
            'type' => ['required', Rule::in(ChildStorySubmissionType::valuesArray())],
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'year_group' => 'required|string|max:50',
            'content' => 'required|string|max:20000',
            'original_filename' => 'nullable|string|max:255',
            'consent_own_work' => 'required|accepted',
            'consent_publish' => 'required|boolean',
        ]);

        $submission = $this->handler->handle(SubmitChildStorySubmissionDTO::from([
            'organizer_id' => $organizerId,
            'type' => $data['type'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'year_group' => $data['year_group'],
            'content' => $data['content'],
            'original_filename' => $data['original_filename'] ?? null,
            'consent_own_work' => (bool) $data['consent_own_work'],
            'consent_publish' => (bool) $data['consent_publish'],
        ]));

        return $this->resourceResponse(
            resource: ChildStorySubmissionResource::class,
            data: $submission,
        );
    }
}
