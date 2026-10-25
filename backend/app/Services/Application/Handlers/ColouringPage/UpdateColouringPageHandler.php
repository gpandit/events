<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ColouringPage;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\DomainObjects\Generated\ColouringPageDomainObjectAbstract;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use HiEvents\Services\Application\Handlers\ColouringPage\DTO\UpdateColouringPageDTO;

class UpdateColouringPageHandler
{
    public function __construct(
        private readonly ColouringPageRepositoryInterface $repository,
    ) {}

    /**
     * @throws ResourceNotFoundException
     */
    public function handle(UpdateColouringPageDTO $dto): ColouringPageDomainObject
    {
        $this->assertBelongsToOrganizer($dto->pageId, $dto->organizerId);

        /** @var ColouringPageDomainObject $page */
        $page = $this->repository->updateFromArray($dto->pageId, [
            ColouringPageDomainObjectAbstract::TITLE => trim(strip_tags($dto->title)),
            ColouringPageDomainObjectAbstract::AGE_GROUP => $dto->ageGroup->value,
            ColouringPageDomainObjectAbstract::TINT => $dto->tint->value,
            ColouringPageDomainObjectAbstract::STATUS => $dto->status->value,
        ]);

        return $page;
    }

    /**
     * @throws ResourceNotFoundException
     */
    private function assertBelongsToOrganizer(int $pageId, int $organizerId): void
    {
        $page = $this->repository->findFirstWhere([
            ColouringPageDomainObjectAbstract::ID => $pageId,
            ColouringPageDomainObjectAbstract::ORGANIZER_ID => $organizerId,
        ]);

        if ($page === null) {
            throw new ResourceNotFoundException(__('Colouring page not found'));
        }
    }
}
