<?php

declare(strict_types=1);

namespace Tests\Unit\Services\Application\Handlers\Sitemap;

use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Sitemap\GetSitemapTxtHandler;
use HiEvents\Services\Domain\Sitemap\SitemapGeneratorService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Mockery as m;
use Tests\TestCase;

class GetSitemapTxtHandlerTest extends TestCase
{
    private EventRepositoryInterface $eventRepository;

    private OrganizerRepositoryInterface $organizerRepository;

    private SitemapGeneratorService $sitemapGenerator;

    private GetSitemapTxtHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->eventRepository = m::mock(EventRepositoryInterface::class);
        $this->organizerRepository = m::mock(OrganizerRepositoryInterface::class);
        $this->sitemapGenerator = m::mock(SitemapGeneratorService::class);

        $this->handler = new GetSitemapTxtHandler(
            $this->eventRepository,
            $this->organizerRepository,
            $this->sitemapGenerator,
        );

        config(['sitemap.cache_ttl' => 3600]);
        config(['sitemap.events_per_page' => 1000]);
        config(['sitemap.organizers_per_page' => 1000]);
        config(['app.frontend_url' => 'https://example.com']);
    }

    public function test_handle_returns_cached_text(): void
    {
        $expectedText = "https://example.com/\n";

        Cache::shouldReceive('remember')
            ->once()
            ->with('sitemap:txt', 3600, m::type('Closure'))
            ->andReturn($expectedText);

        $result = $this->handler->handle();

        $this->assertEquals($expectedText, $result);
    }

    public function test_handle_combines_static_organizer_and_event_urls_on_cache_miss(): void
    {
        $organizers = new Collection([m::mock(OrganizerDomainObject::class)]);
        $organizerPaginator = m::mock(LengthAwarePaginator::class);
        $organizerPaginator->shouldReceive('getCollection')->andReturn($organizers);

        $events = new Collection([m::mock(EventDomainObject::class)]);
        $eventPaginator = m::mock(LengthAwarePaginator::class);
        $eventPaginator->shouldReceive('getCollection')->andReturn($events);

        $this->organizerRepository
            ->shouldReceive('getSitemapOrganizerCount')
            ->once()
            ->andReturn(1);

        $this->organizerRepository
            ->shouldReceive('getSitemapOrganizers')
            ->once()
            ->with(1, 1000)
            ->andReturn($organizerPaginator);

        $this->sitemapGenerator
            ->shouldReceive('generateOrganizersUrlList')
            ->once()
            ->with($organizers, 'https://example.com')
            ->andReturn(['https://example.com/events/1/my-organizer']);

        $this->eventRepository
            ->shouldReceive('getSitemapEventCount')
            ->once()
            ->andReturn(1);

        $this->eventRepository
            ->shouldReceive('getSitemapEvents')
            ->once()
            ->with(1, 1000)
            ->andReturn($eventPaginator);

        $this->sitemapGenerator
            ->shouldReceive('generateEventsUrlList')
            ->once()
            ->with($events, 'https://example.com')
            ->andReturn(['https://example.com/event/1/my-event']);

        Cache::shouldReceive('remember')
            ->once()
            ->with('sitemap:txt', 3600, m::type('Closure'))
            ->andReturnUsing(fn ($key, $ttl, $callback) => $callback());

        $result = $this->handler->handle();

        $this->assertStringContainsString("https://example.com/\n", $result);
        $this->assertStringContainsString('https://example.com/privacy-policy', $result);
        $this->assertStringContainsString('https://example.com/terms-of-service', $result);
        $this->assertStringContainsString('https://example.com/cookie-policy', $result);
        $this->assertStringContainsString('https://example.com/events/1/my-organizer', $result);
        $this->assertStringContainsString('https://example.com/event/1/my-event', $result);
    }

    public function test_handle_skips_pagination_when_no_organizers_or_events_exist(): void
    {
        $this->organizerRepository
            ->shouldReceive('getSitemapOrganizerCount')
            ->once()
            ->andReturn(0);

        $this->organizerRepository
            ->shouldNotReceive('getSitemapOrganizers');

        $this->eventRepository
            ->shouldReceive('getSitemapEventCount')
            ->once()
            ->andReturn(0);

        $this->eventRepository
            ->shouldNotReceive('getSitemapEvents');

        Cache::shouldReceive('remember')
            ->once()
            ->andReturnUsing(fn ($key, $ttl, $callback) => $callback());

        $result = $this->handler->handle();

        $this->assertEquals(
            "https://example.com/\nhttps://example.com/privacy-policy\nhttps://example.com/terms-of-service\nhttps://example.com/cookie-policy\n",
            $result,
        );
    }

    public function test_handle_trims_trailing_slash_from_base_url(): void
    {
        config(['app.frontend_url' => 'https://example.com/']);

        $this->organizerRepository->shouldReceive('getSitemapOrganizerCount')->once()->andReturn(0);
        $this->eventRepository->shouldReceive('getSitemapEventCount')->once()->andReturn(0);

        Cache::shouldReceive('remember')
            ->once()
            ->andReturnUsing(fn ($key, $ttl, $callback) => $callback());

        $result = $this->handler->handle();

        $this->assertStringStartsWith("https://example.com/\n", $result);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
