<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\DomainObjects\Generated\ChildStorySubmissionDomainObjectAbstract;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use HiEvents\Repository\Interfaces\ChildStorySubmissionRepositoryInterface;
use HiEvents\Services\Application\Handlers\ChildStorySubmission\DTO\SubmitChildStorySubmissionDTO;
use HiEvents\Services\Infrastructure\HtmlPurifier\HtmlPurifierService;
use Illuminate\Support\Carbon;

class SubmitChildStorySubmissionHandler
{
    public function __construct(
        private readonly ChildStorySubmissionRepositoryInterface $repository,
        private readonly HtmlPurifierService $purifier,
    ) {}

    public function handle(SubmitChildStorySubmissionDTO $dto): ChildStorySubmissionDomainObject
    {
        /** @var ChildStorySubmissionDomainObject $submission */
        $submission = $this->repository->create([
            ChildStorySubmissionDomainObjectAbstract::ORGANIZER_ID => $dto->organizer_id,
            ChildStorySubmissionDomainObjectAbstract::TYPE => $dto->type,
            ChildStorySubmissionDomainObjectAbstract::FIRST_NAME => $dto->first_name,
            ChildStorySubmissionDomainObjectAbstract::LAST_NAME => $dto->last_name,
            ChildStorySubmissionDomainObjectAbstract::YEAR_GROUP => $dto->year_group,
            ChildStorySubmissionDomainObjectAbstract::CONTENT => $this->purifier->purify($dto->content),
            ChildStorySubmissionDomainObjectAbstract::ORIGINAL_FILENAME => $dto->original_filename,
            ChildStorySubmissionDomainObjectAbstract::CONSENT_OWN_WORK => $dto->consent_own_work,
            ChildStorySubmissionDomainObjectAbstract::CONSENT_PUBLISH => $dto->consent_publish,
            ChildStorySubmissionDomainObjectAbstract::STATUS => ChildStorySubmissionStatus::PENDING->value,
            ChildStorySubmissionDomainObjectAbstract::SUBMITTED_AT => Carbon::now(),
        ]);

        return $submission;
    }
}
