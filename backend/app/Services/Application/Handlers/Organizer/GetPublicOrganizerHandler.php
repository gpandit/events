<?php

namespace HiEvents\Services\Application\Handlers\Organizer;

use HiEvents\DomainObjects\ImageDomainObject;
use HiEvents\DomainObjects\LocationDomainObject;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\OrganizerSettingDomainObject;
use HiEvents\DomainObjects\Status\EventStatus;
use HiEvents\Repository\Eloquent\Value\Relationship;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;

class GetPublicOrganizerHandler
{
    public function __construct(
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly EventRepositoryInterface $eventRepository,
    ) {}

    public function handle(int $organizerId): OrganizerDomainObject
    {
        $organizer = $this->organizerRepository
            ->loadRelation(ImageDomainObject::class)
            ->loadRelation(OrganizerSettingDomainObject::class)
            ->loadRelation(new Relationship(LocationDomainObject::class, name: 'location_record'))
            ->findById($organizerId);

        return $organizer->setHasLiveShops($this->eventRepository->countWhere([
            'organizer_id' => $organizerId,
            'is_shop' => true,
            'status' => EventStatus::LIVE->name,
        ]) > 0);
    }
}
