<?php

declare(strict_types=1);

namespace HiEvents\DomainObjects;

use HiEvents\Helper\Url;

class ColouringPageDomainObject extends Generated\ColouringPageDomainObjectAbstract
{
    public function isBundledAsset(): bool
    {
        return str_starts_with($this->getPdfPath(), '/');
    }

    public function getPdfUrl(): string
    {
        return $this->assetUrl($this->getPdfPath());
    }

    public function getThumbnailUrl(): string
    {
        return $this->assetUrl($this->getThumbnailPath());
    }

    private function assetUrl(string $path): string
    {
        return $this->isBundledAsset() ? $path : Url::getCdnUrl($path);
    }
}
