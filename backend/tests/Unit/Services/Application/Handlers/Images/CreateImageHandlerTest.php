<?php

namespace Tests\Unit\Services\Application\Handlers\Images;

use HiEvents\DomainObjects\Enums\ImageType;
use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\DomainObjects\ImageDomainObject;
use HiEvents\DomainObjects\ProductDomainObject;
use HiEvents\DomainObjects\UserDomainObject;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Repository\Interfaces\ImageRepositoryInterface;
use HiEvents\Repository\Interfaces\OrganizerRepositoryInterface;
use HiEvents\Repository\Interfaces\ProductRepositoryInterface;
use HiEvents\Services\Application\Handlers\Images\CreateImageHandler;
use HiEvents\Services\Application\Handlers\Images\DTO\CreateImageDTO;
use HiEvents\Services\Domain\Image\ImageUploadService;
use HiEvents\Services\Infrastructure\Image\Exception\CouldNotUploadImageException;
use Illuminate\Http\UploadedFile;
use Mockery as m;
use Tests\TestCase;

class CreateImageHandlerTest extends TestCase
{
    private ImageUploadService $imageUploadService;

    private CreateImageHandler $handler;

    private ProductRepositoryInterface $productRepository;

    private EventRepositoryInterface $eventRepository;

    private ImageRepositoryInterface $imageRepository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->imageUploadService = m::mock(ImageUploadService::class);
        $organizerRepository = m::mock(OrganizerRepositoryInterface::class);
        $this->eventRepository = m::mock(EventRepositoryInterface::class);
        $this->imageRepository = m::mock(ImageRepositoryInterface::class);
        $this->productRepository = m::mock(ProductRepositoryInterface::class);

        $this->handler = new CreateImageHandler(
            $this->imageUploadService,
            $organizerRepository,
            $this->eventRepository,
            $this->imageRepository,
            $this->productRepository,
        );
    }

    public function test_handle_successfully_creates_image(): void
    {
        $uploadedFile = m::mock(UploadedFile::class);
        $imageDomainObject = m::mock(ImageDomainObject::class);
        $accountId = 123;

        $dto = new CreateImageDTO(
            userId: 42,
            accountId: $accountId,
            image: $uploadedFile
        );

        $this->imageUploadService
            ->shouldReceive('upload')
            ->once()
            ->withArgs([
                $uploadedFile,
                42,
                UserDomainObject::class,
                ImageType::GENERIC->name,
                $accountId,
            ])
            ->andReturn($imageDomainObject);

        $result = $this->handler->handle($dto);

        $this->assertSame($imageDomainObject, $result);
    }

    public function test_product_image_is_uploaded_for_a_product_in_the_account(): void
    {
        $uploadedFile = m::mock(UploadedFile::class);
        $imageDomainObject = m::mock(ImageDomainObject::class);

        $this->productRepository->shouldReceive('findById')->with(7)
            ->andReturn((new ProductDomainObject)->setEventId(3));
        $this->eventRepository->shouldReceive('findById')->with(3)
            ->andReturn((new EventDomainObject)->setAccountId(123));
        $this->imageRepository->shouldReceive('countWhere')->once()->andReturn(2);
        $this->imageUploadService->shouldReceive('upload')->once()
            ->withArgs([$uploadedFile, 7, ProductDomainObject::class, ImageType::PRODUCT_IMAGE->name, 123])
            ->andReturn($imageDomainObject);

        $result = $this->handler->handle(new CreateImageDTO(
            userId: 42,
            accountId: 123,
            image: $uploadedFile,
            imageType: ImageType::PRODUCT_IMAGE,
            entityId: 7,
        ));

        $this->assertSame($imageDomainObject, $result);
    }

    public function test_product_image_is_rejected_for_a_product_in_another_account(): void
    {
        $this->productRepository->shouldReceive('findById')->with(7)
            ->andReturn((new ProductDomainObject)->setEventId(3));
        $this->eventRepository->shouldReceive('findById')->with(3)
            ->andReturn((new EventDomainObject)->setAccountId(999));

        $this->expectException(CouldNotUploadImageException::class);

        $this->handler->handle(new CreateImageDTO(
            userId: 42,
            accountId: 123,
            image: m::mock(UploadedFile::class),
            imageType: ImageType::PRODUCT_IMAGE,
            entityId: 7,
        ));
    }

    public function test_product_image_is_rejected_once_the_limit_is_reached(): void
    {
        $this->productRepository->shouldReceive('findById')->with(7)
            ->andReturn((new ProductDomainObject)->setEventId(3));
        $this->eventRepository->shouldReceive('findById')->with(3)
            ->andReturn((new EventDomainObject)->setAccountId(123));
        $this->imageRepository->shouldReceive('countWhere')
            ->andReturn(CreateImageHandler::MAX_PRODUCT_IMAGES);

        $this->expectException(CouldNotUploadImageException::class);

        $this->handler->handle(new CreateImageDTO(
            userId: 42,
            accountId: 123,
            image: m::mock(UploadedFile::class),
            imageType: ImageType::PRODUCT_IMAGE,
            entityId: 7,
        ));
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
