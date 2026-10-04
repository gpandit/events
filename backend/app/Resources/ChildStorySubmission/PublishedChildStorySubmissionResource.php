<?php

declare(strict_types=1);

namespace HiEvents\Resources\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\Resources\BaseResource;

/**
 * @mixin ChildStorySubmissionDomainObject
 */
class PublishedChildStorySubmissionResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->getId(),
            'type' => $this->getType(),
            'first_name' => $this->getFirstName(),
            'last_initial' => $this->getLastInitial(),
            'year_group' => $this->getYearGroup(),
            'content' => $this->getContent(),
            'submitted_at' => $this->getSubmittedAt(),
            'published_at' => $this->getPublishedAt(),
        ];
    }
}
