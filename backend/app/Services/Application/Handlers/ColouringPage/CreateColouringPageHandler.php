<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\ColouringPage;

use HiEvents\DomainObjects\ColouringPageDomainObject;
use HiEvents\DomainObjects\Generated\ColouringPageDomainObjectAbstract;
use HiEvents\Exceptions\CouldNotStoreColouringPageFilesException;
use HiEvents\Repository\Interfaces\ColouringPageRepositoryInterface;
use HiEvents\Services\Application\Handlers\ColouringPage\DTO\CreateColouringPageDTO;
use HiEvents\Services\Infrastructure\ColouringPage\ColouringPageFileStorageService;
use Throwable;

class CreateColouringPageHandler
{
    public function __construct(
        private readonly ColouringPageRepositoryInterface $repository,
        private readonly ColouringPageFileStorageService $fileStorage,
    ) {}

    /**
     * @throws CouldNotStoreColouringPageFilesException
     * @throws Throwable
     */
    public function handle(CreateColouringPageDTO $dto): ColouringPageDomainObject
    {
        $title = trim(strip_tags($dto->title));
        $files = $this->fileStorage->store($dto->pdf, $dto->thumbnail, $title);

        try {
            /** @var ColouringPageDomainObject $page */
            $page = $this->repository->create([
                ColouringPageDomainObjectAbstract::ORGANIZER_ID => $dto->organizerId,
                ColouringPageDomainObjectAbstract::TITLE => $title,
                ColouringPageDomainObjectAbstract::AGE_GROUP => $dto->ageGroup->value,
                ColouringPageDomainObjectAbstract::TINT => $dto->tint->value,
                ColouringPageDomainObjectAbstract::STATUS => $dto->status->value,
                ColouringPageDomainObjectAbstract::PDF_PATH => $files->pdf_path,
                ColouringPageDomainObjectAbstract::THUMBNAIL_PATH => $files->thumbnail_path,
                ColouringPageDomainObjectAbstract::SORT_ORDER => $this->repository->findNextSortOrder($dto->organizerId),
            ]);
        } catch (Throwable $exception) {
            $this->fileStorage->delete($files->pdf_path, $files->thumbnail_path);

            throw $exception;
        }

        return $page;
    }
}
