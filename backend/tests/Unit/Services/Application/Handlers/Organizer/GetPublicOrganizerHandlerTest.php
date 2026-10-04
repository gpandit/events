<?php

namespace Tests\Unit\Services\Application\Handlers\Organizer;

use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Services\Application\Handlers\Organizer\GetPublicOrganizerHandler;
use Mockery as m;
use Tests\TestCase;

class GetPublicOrganizerHandlerTest extends TestCase
{
    public function test_organizer_with_a_live_shop_is_flagged(): void
    {
        $this->assertTrue($this->handle(2)->getHasLiveShops());
    }

    public function test_organizer_without_a_live_shop_is_not_flagged(): void
    {
        $this->assertFalse($this->handle(0)->getHasLiveShops());
    }

    private function handle(int $liveShops): OrganizerDomainObject
    {
        $organizers = m::mock(OrganizerRepositoryInterface::class);
        $organizers->shouldReceive('loadRelation')->andReturnSelf();
        $organizers->shouldReceive('findById')->with(4)->andReturn((new OrganizerDomainObject)->setId(4));

        $events = m::mock(EventRepositoryInterface::class);
        $events->shouldReceive('countWhere')
            ->once()
            ->with(['organizer_id' => 4, 'is_shop' => true, 'status' => 'LIVE'])
            ->andReturn($liveShops);

        return (new GetPublicOrganizerHandler($organizers, $events))->handle(4);
    }
}
