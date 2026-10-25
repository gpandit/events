<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ColouringPage;

use HiEvents\DomainObjects\Generated\ColouringPageDomainObjectAbstract;
use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use Illuminate\Database\DatabaseManager;
use Throwable;

class ReorderColouringPagesHandler
{
    public function __construct(
        private readonly ColouringPageRepositoryInterface $repository,
        private readonly DatabaseManager $databaseManager,
    ) {}

    /**
     * @param  int[]  $orderedPageIds
     *
     * @throws ResourceNotFoundException
     * @throws Throwable
     */
    public function handle(?int $organizerId, array $orderedPageIds): void
    {
        if ($this->repository->findOwnedPages($orderedPageIds, $organizerId)->count() !== count($orderedPageIds)) {
            throw new ResourceNotFoundException(__('Colouring page not found'));
        }

        $this->databaseManager->transaction(function () use ($orderedPageIds) {
            foreach (array_values($orderedPageIds) as $position => $pageId) {
                $this->repository->updateFromArray($pageId, [
                    ColouringPageDomainObjectAbstract::SORT_ORDER => $position,
                ]);
            }
        });
    }
}
