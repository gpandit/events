<?php

namespace HiEvents\Services\Application\Handlers\Images;

use HiEvents\DomainObjects\Enums\ImageType;
use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\DomainObjects\ImageDomainObject;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\ProductDomainObject;
use HiEvents\DomainObjects\UserDomainObject;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\ImageRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Repository\Interfaces\ProductRepositoryInterface;
use HiEvents\Services\Application\Handlers\Images\DTO\CreateImageDTO;
use HiEvents\Services\Domain\Image\ImageUploadService;
use HiEvents\Services\Infrastructure\Image\Exception\CouldNotUploadImageException;

class CreateImageHandler
{
    private const IMAGES_TYPES_WITH_ONLY_ONE_IMAGE_ALLOWED = [
        ImageType::ORGANIZER_LOGO,
        ImageType::ORGANIZER_COVER,
        ImageType::EVENT_COVER,
        ImageType::TICKET_LOGO,
    ];

    public const MAX_PRODUCT_IMAGES = 8;

    public function __construct(
        private readonly ImageUploadService $imageUploadService,
        private readonly OrganizerRepositoryInterface $organizerRepository,
        private readonly EventRepositoryInterface $eventRepository,
        private readonly ImageRepositoryInterface $imageRepository,
        private readonly ProductRepositoryInterface $productRepository,
    ) {}

    /**
     * @throws CouldNotUploadImageException
     */
    public function handle(CreateImageDTO $imageData): ImageDomainObject
    {
        if ($imageData->isGeneric()) {
            // For generic images, we associate them with the user
            return $this->imageUploadService->upload(
                image: $imageData->image,
                entityId: $imageData->userId,
                entityType: UserDomainObject::class,
                imageType: ImageType::GENERIC->name,
                accountId: $imageData->accountId,
            );
        }

        if ($imageData->entityId === null) {
            throw new CouldNotUploadImageException('Entity ID is required for non-generic images.');
        }

        $entityType = $imageData->imageType->getEntityType();

        $this->validateEntityBelongsToUser($imageData->accountId, $imageData->entityId, $entityType);

        $this->validateProductImageLimit($imageData, $entityType);

        $this->deleteExistingImages($imageData, $entityType);

        return $this->imageUploadService->upload(
            image: $imageData->image,
            entityId: $imageData->entityId,
            entityType: $entityType,
            imageType: $imageData->imageType->name,
            accountId: $imageData->accountId,
        );
    }

    /**
     * @throws CouldNotUploadImageException
     */
    private function validateEntityBelongsToUser(int $accountId, int $entityId, string $entityType): void
    {
        switch ($entityType) {
            case OrganizerDomainObject::class:
                $organizer = $this->organizerRepository->findById($entityId);
                if ($organizer->getAccountId() !== $accountId) {
                    throw new CouldNotUploadImageException('Organizer does not belong to the user.');
                }
                break;

            case ProductDomainObject::class:
                $product = $this->productRepository->findById($entityId);
                $event = $this->eventRepository->findById($product->getEventId());
                if ($event->getAccountId() !== $accountId) {
                    throw new CouldNotUploadImageException('Product does not belong to the user.');
                }
                break;

            case EventDomainObject::class:
                $event = $this->eventRepository->findById($entityId);
                if ($event->getAccountId() !== $accountId) {
                    throw new CouldNotUploadImageException('Event does not belong to the user.');
                }
                break;
        }
    }

    /**
     * @throws CouldNotUploadImageException
     */
    private function validateProductImageLimit(CreateImageDTO $imageData, string $entityType): void
    {
        if ($entityType !== ProductDomainObject::class) {
            return;
        }

        $existingImages = $this->imageRepository->countWhere([
            'entity_id' => $imageData->entityId,
            'entity_type' => $entityType,
            'type' => $imageData->imageType->name,
        ]);

        if ($existingImages >= self::MAX_PRODUCT_IMAGES) {
            throw new CouldNotUploadImageException(
                __('A product can have at most :max images.', ['max' => self::MAX_PRODUCT_IMAGES])
            );
        }
    }

    private function deleteExistingImages(CreateImageDTO $imageData, string $entityType): void
    {
        if (in_array($imageData->imageType, self::IMAGES_TYPES_WITH_ONLY_ONE_IMAGE_ALLOWED, true)) {
            $this->imageRepository->deleteWhere([
                'entity_id' => $imageData->entityId,
                'entity_type' => $entityType,
                'type' => $imageData->imageType->name,
            ]);
        }
    }
}
