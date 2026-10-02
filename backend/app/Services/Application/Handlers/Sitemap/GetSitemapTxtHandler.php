<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\Sitemap;

use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Services\Domain\Sitemap\SitemapGeneratorService;
use Illuminate\Support\Facades\Cache;

class GetSitemapTxtHandler
{
    private const CACHE_KEY = 'sitemap:txt';

    private const MIN_PAGE = 1;

    private const STATIC_PATHS = [
        '/',
        '/privacy-policy',
        '/terms-of-service',
        '/cookie-policy',
    ];

    public function __construct(
        private readonly EventRepositoryInterface $eventRepository,
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly SitemapGeneratorService $sitemapGenerator,
    ) {}

    public function handle(): string
    {
        $cacheTtl = (int) config('sitemap.cache_ttl');

        return Cache::remember(self::CACHE_KEY, $cacheTtl, function (): string {
            $baseUrl = rtrim((string) config('app.frontend_url'), '/');

            $urls = array_map(
                static fn (string $path): string => $baseUrl.$path,
                self::STATIC_PATHS,
            );

            $urls = array_merge($urls, $this->getAllOrganizerUrls($baseUrl));
            $urls = array_merge($urls, $this->getAllEventUrls($baseUrl));

            return implode("\n", $urls)."\n";
        });
    }

    /**
     * @return array<int, string>
     */
    private function getAllOrganizerUrls(string $baseUrl): array
    {
        $perPage = (int) config('sitemap.organizers_per_page');
        $totalPages = $this->calculateTotalPages($this->organizerRepository->getSitemapOrganizerCount(), $perPage);

        $urls = [];
        for ($page = self::MIN_PAGE; $page <= $totalPages; $page++) {
            $organizers = $this->organizerRepository->getSitemapOrganizers($page, $perPage);
            $urls = array_merge($urls, $this->sitemapGenerator->generateOrganizersUrlList($organizers->getCollection(), $baseUrl));
        }

        return $urls;
    }

    /**
     * @return array<int, string>
     */
    private function getAllEventUrls(string $baseUrl): array
    {
        $perPage = (int) config('sitemap.events_per_page');
        $totalPages = $this->calculateTotalPages($this->eventRepository->getSitemapEventCount(), $perPage);

        $urls = [];
        for ($page = self::MIN_PAGE; $page <= $totalPages; $page++) {
            $events = $this->eventRepository->getSitemapEvents($page, $perPage);
            $urls = array_merge($urls, $this->sitemapGenerator->generateEventsUrlList($events->getCollection(), $baseUrl));
        }

        return $urls;
    }

    private function calculateTotalPages(int $total, int $perPage): int
    {
        return $total > 0 ? (int) ceil($total / $perPage) : 0;
    }
}
