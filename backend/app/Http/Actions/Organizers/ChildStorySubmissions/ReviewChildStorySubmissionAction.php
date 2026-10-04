<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\ChildStorySubmissions;

use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use HiEvents\Exceptions\ChildStoryPublicationNotPermittedException;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Resources\ChildStorySubmission\ChildStorySubmissionResource;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\ReviewChildStorySubmissionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ReviewChildStorySubmissionAction extends BaseAction
{
    public function __construct(
        private readonly ReviewChildStorySubmissionHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     * @throws ResourceNotFoundException
     */
    public function __invoke(Request $request, int $organizerId, int $submissionId): JsonResponse
    {
        $this->isActionAuthorized($organizerId, OrganizerDomainObject::class);

        $data = $this->validate($request, [
            'status' => ['required', Rule::in([
                ChildStorySubmissionStatus::APPROVED->value,
                ChildStorySubmissionStatus::REJECTED->value,
            ])],
        ]);

        try {
            $submission = $this->handler->handle(
                submissionId: $submissionId,
                organizerId: $organizerId,
                status: ChildStorySubmissionStatus::from($data['status']),
            );
        } catch (ChildStoryPublicationNotPermittedException $exception) {
            throw ValidationException::withMessages(['status' => $exception->getMessage()]);
        }

        return $this->resourceResponse(
            resource: ChildStorySubmissionResource::class,
            data: $submission,
        );
    }
}
