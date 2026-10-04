<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ChildStorySubmission\DTO;

use HiEvents\DataTransferObjects\BaseDataObject;

class SubmitChildStorySubmissionDTO extends BaseDataObject
{
    public function __construct(
        public int $organizer_id,
        public string $type,
        public string $first_name,
        public string $last_name,
        public string $year_group,
        public string $content,
        public ?string $original_filename,
        public bool $consent_own_work,
        public bool $consent_publish,
        public ?string $parent_email = null,
    ) {}
}
