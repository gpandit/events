<?php

declare(strict_types=1);

namespace HiEvents\Resources\ChildStorySubmission;

use HiEvents\DomainObjects\ChildStorySubmissionDomainObject;
use HiEvents\Resources\BaseResource;

/**
 * @mixin ChildStorySubmissionDomainObject
 */
class ChildStorySubmissionResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->getId(),
            'organizer_id' => $this->getOrganizerId(),
            'type' => $this->getType(),
            'first_name' => $this->getFirstName(),
            'last_name' => $this->getLastName(),
            'year_group' => $this->getYearGroup(),
            'content' => $this->getContent(),
            'original_filename' => $this->getOriginalFilename(),
            'consent_own_work' => $this->getConsentOwnWork(),
            'consent_publish' => $this->getConsentPublish(),
            'parent_email' => $this->getParentalConsent()?->getParentEmail(),
            'parent_consent_status' => $this->getParentalConsent()?->getStatus(),
            'status' => $this->getStatus(),
            'submitted_at' => $this->getSubmittedAt(),
            'reviewed_at' => $this->getReviewedAt(),
            'published_at' => $this->getPublishedAt(),
        ];
    }
}
