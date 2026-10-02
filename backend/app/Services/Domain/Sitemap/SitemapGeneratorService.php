<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\Sitemap;

use Carbon\Carbon;
use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\DomainObjects\OrganizerDomainObject;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use XMLWriter;

class SitemapGeneratorService
{
    private const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

    private const XML_VERSION = '1.0';

    private const XML_ENCODING = 'UTF-8';

    private const INDENT_STRING = '  ';

    private const CHANGEFREQ_DAILY = 'daily';

    private const CHANGEFREQ_WEEKLY = 'weekly';

    private const PRIORITY_HIGH = '0.8';

    private const PRIORITY_MEDIUM = '0.6';

    private const PRIORITY_LOW = '0.5';

    private const DEFAULT_EVENT_SLUG = 'event';

    private const DEFAULT_ORGANIZER_SLUG = 'organizer';

    private const EVENT_URL_PATTERN = '/event/%d/%s';

    private const ORGANIZER_URL_PATTERN = '/events/%d/%s';

    private const SITEMAP_EVENTS_URL_PATTERN = '/sitemap-events-%d.xml';

    private const SITEMAP_ORGANIZERS_URL_PATTERN = '/sitemap-organizers-%d.xml';

    public function generateSitemapIndex(
        int $totalEventPages,
        int $totalOrganizerPages,
        string $baseUrl,
        string $lastMod,
    ): string {
        $writer = $this->createXmlWriter();

        $writer->startDocument(self::XML_VERSION, self::XML_ENCODING);
        $writer->startElement('sitemapindex');
        $writer->writeAttribute('xmlns', self::SITEMAP_NAMESPACE);

        for ($page = 1; $page <= $totalEventPages; $page++) {
            $this->writeSitemapEntry($writer, $baseUrl.sprintf(self::SITEMAP_EVENTS_URL_PATTERN, $page), $lastMod);
        }

        for ($page = 1; $page <= $totalOrganizerPages; $page++) {
            $this->writeSitemapEntry($writer, $baseUrl.sprintf(self::SITEMAP_ORGANIZERS_URL_PATTERN, $page), $lastMod);
        }

        $writer->endElement();
        $writer->endDocument();

        return $writer->outputMemory();
    }

    private function writeSitemapEntry(XMLWriter $writer, string $loc, string $lastMod): void
    {
        $writer->startElement('sitemap');
        $writer->writeElement('loc', $loc);
        $writer->writeElement('lastmod', $lastMod);
        $writer->endElement();
    }

    /**
     * @param  Collection<int, EventDomainObject>  $events
     */
    public function generateEventsSitemap(Collection $events, string $baseUrl): string
    {
        $writer = $this->createXmlWriter();

        $writer->startDocument(self::XML_VERSION, self::XML_ENCODING);
        $writer->startElement('urlset');
        $writer->writeAttribute('xmlns', self::SITEMAP_NAMESPACE);

        $now = now();

        foreach ($events as $event) {
            $this->writeEventUrl($writer, $event, $baseUrl, $now);
        }

        $writer->endElement();
        $writer->endDocument();

        return $writer->outputMemory();
    }

    private function createXmlWriter(): XMLWriter
    {
        $writer = new XMLWriter;
        $writer->openMemory();
        $writer->setIndent(true);
        $writer->setIndentString(self::INDENT_STRING);

        return $writer;
    }

    private function writeEventUrl(XMLWriter $writer, EventDomainObject $event, string $baseUrl, Carbon $now): void
    {
        $eventUrl = $this->getEventUrl($event, $baseUrl);

        $isUpcoming = $this->isEventUpcoming($event, $now);
        $lastMod = Carbon::parse($event->getUpdatedAt())->toAtomString();

        $writer->startElement('url');
        $writer->writeElement('loc', $eventUrl);
        $writer->writeElement('lastmod', $lastMod);
        $writer->writeElement('changefreq', $isUpcoming ? self::CHANGEFREQ_DAILY : self::CHANGEFREQ_WEEKLY);
        $writer->writeElement('priority', $isUpcoming ? self::PRIORITY_HIGH : self::PRIORITY_LOW);
        $writer->endElement();
    }

    public function getEventUrl(EventDomainObject $event, string $baseUrl): string
    {
        $slug = Str::slug($event->getTitle()) ?: self::DEFAULT_EVENT_SLUG;

        return $baseUrl.sprintf(self::EVENT_URL_PATTERN, $event->getId(), $slug);
    }

    /**
     * @param  Collection<int, EventDomainObject>  $events
     * @return array<int, string>
     */
    public function generateEventsUrlList(Collection $events, string $baseUrl): array
    {
        return $events->map(fn (EventDomainObject $event) => $this->getEventUrl($event, $baseUrl))->values()->all();
    }

    private function isEventUpcoming(EventDomainObject $event, Carbon $now): bool
    {
        $startDate = $event->getStartDate();

        return $startDate !== null && Carbon::parse($startDate)->gte($now);
    }

    /**
     * @param  Collection<int, OrganizerDomainObject>  $organizers
     */
    public function generateOrganizersSitemap(Collection $organizers, string $baseUrl): string
    {
        $writer = $this->createXmlWriter();

        $writer->startDocument(self::XML_VERSION, self::XML_ENCODING);
        $writer->startElement('urlset');
        $writer->writeAttribute('xmlns', self::SITEMAP_NAMESPACE);

        foreach ($organizers as $organizer) {
            $this->writeOrganizerUrl($writer, $organizer, $baseUrl);
        }

        $writer->endElement();
        $writer->endDocument();

        return $writer->outputMemory();
    }

    private function writeOrganizerUrl(XMLWriter $writer, OrganizerDomainObject $organizer, string $baseUrl): void
    {
        $organizerUrl = $this->getOrganizerUrl($organizer, $baseUrl);
        $lastMod = Carbon::parse($organizer->getUpdatedAt())->toAtomString();

        $writer->startElement('url');
        $writer->writeElement('loc', $organizerUrl);
        $writer->writeElement('lastmod', $lastMod);
        $writer->writeElement('changefreq', self::CHANGEFREQ_WEEKLY);
        $writer->writeElement('priority', self::PRIORITY_MEDIUM);
        $writer->endElement();
    }

    public function getOrganizerUrl(OrganizerDomainObject $organizer, string $baseUrl): string
    {
        $slug = Str::slug($organizer->getName()) ?: self::DEFAULT_ORGANIZER_SLUG;

        return $baseUrl.sprintf(self::ORGANIZER_URL_PATTERN, $organizer->getId(), $slug);
    }

    /**
     * @param  Collection<int, OrganizerDomainObject>  $organizers
     * @return array<int, string>
     */
    public function generateOrganizersUrlList(Collection $organizers, string $baseUrl): array
    {
        return $organizers->map(fn (OrganizerDomainObject $organizer) => $this->getOrganizerUrl($organizer, $baseUrl))->values()->all();
    }
}
