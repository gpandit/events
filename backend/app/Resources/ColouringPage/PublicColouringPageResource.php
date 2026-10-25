<?php

declare(strict_types=1);

namespace HiEvents\Resources\ColouringPage;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\Resources\BaseResource;

/**
 * @mixin ColouringPageDomainObject
 */
class PublicColouringPageResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->getId(),
            'title' => $this->getTitle(),
            /** @var 'AGE_2_5'|'AGE_6_10'|'AGE_11_13'|'AGE_14_18' */
            'age_group' => $this->getAgeGroup(),
            /** @var 'PEACH'|'SKY'|'MINT'|'LILAC' */
            'tint' => $this->getTint(),
            'pdf_url' => $this->getPdfUrl(),
            'thumbnail_url' => $this->getThumbnailUrl(),
        ];
    }
}
