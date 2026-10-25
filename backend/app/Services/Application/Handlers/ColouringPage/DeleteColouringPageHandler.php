<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ColouringPage;

use HiEvents\Exceptions\ResourceNotFoundException;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use HiEvents\Services\Infrastructure\ColouringPage\ColouringPageFileStorageService;

class DeleteColouringPageHandler
{
    public function __construct(
        private readonly ColouringPageRepositoryInterface $repository,
        private readonly ColouringPageFileStorageService $fileStorage,
    ) {}

    /**
     * @throws ResourceNotFoundException
     */
    public function handle(int $pageId, ?int $organizerId): void
    {
        $page = $this->repository->findOwnedPage($pageId, $organizerId);

        if ($page === null) {
            throw new ResourceNotFoundException(__('Colouring page not found'));
        }

        $this->repository->deleteById($pageId);

        if (! $page->isBundledAsset()) {
            $this->fileStorage->delete($page->getPdfPath(), $page->getThumbnailPath());
        }
    }
}
