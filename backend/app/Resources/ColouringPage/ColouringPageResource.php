<?php

declare(strict_types=1);

namespace HiEvents\Resources\ColouringPage;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\Resources\BaseResource;

/**
 * @mixin ColouringPageDomainObject
 */
class ColouringPageResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->getId(),
            'organizer_id' => $this->getOrganizerId(),
            'title' => $this->getTitle(),
            /** @var 'AGE_2_5'|'AGE_6_10'|'AGE_11_13'|'AGE_14_18' */
            'age_group' => $this->getAgeGroup(),
            /** @var 'PEACH'|'SKY'|'MINT'|'LILAC' */
            'tint' => $this->getTint(),
            /** @var 'DRAFT'|'PUBLISHED' */
            'status' => $this->getStatus(),
            'sort_order' => $this->getSortOrder(),
            'pdf_url' => $this->getPdfUrl(),
            'thumbnail_url' => $this->getThumbnailUrl(),
            'created_at' => $this->getCreatedAt(),
        ];
    }
}
