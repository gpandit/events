<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Sitemap;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\Sitemap\GetSitemapTxtHandler;
use Illuminate\Http\Response;

class GetSitemapTxtAction extends BaseAction
{
    private const CONTENT_TYPE_TEXT = 'text/plain; charset=utf-8';

    public function __construct(
        private readonly GetSitemapTxtHandler $handler,
    ) {}

    public function __invoke(): Response
    {
        $text = $this->handler->handle();
        $cacheTtl = (int) config('sitemap.cache_ttl');

        return $this->textResponse(
            textContent: $text,
            headers: [
                'Content-Type' => self::CONTENT_TYPE_TEXT,
                'Cache-Control' => "public, max-age=$cacheTtl",
            ]);
    }
}
