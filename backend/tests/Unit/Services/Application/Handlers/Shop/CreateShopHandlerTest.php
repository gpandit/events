<?php

namespace Tests\Unit\Services\Application\Handlers\Shop;

use HiEvents\DomainObjects\Enums\ShopCategory;
use HiEvents\DomainObjects\Enums\ShopVendorType;
use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\DomainObjects\OrganizerDomainObject;
use HiEvents\DomainObjects\ProductCategoryDomainObject;
use HiEvents\DomainObjects\QuestionDomainObject;
use HiEvents\Exceptions\ShopAlreadyExistsException;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Services\Application\Handlers\Shop\CreateShopHandler;
use HiEvents\Services\Application\Handlers\Shop\DTO\CreateShopDTO;
use HiEvents\Services\Domain\Event\CreateEventService;
use HiEvents\Services\Domain\Organizer\OrganizerFetchService;
use HiEvents\Services\Domain\ProductCategory\CreateProductCategoryService;
use HiEvents\Services\Domain\Question\CreateQuestionService;
use Illuminate\Database\DatabaseManager;
use Mockery as m;
use Tests\TestCase;

class CreateShopHandlerTest extends TestCase
{
    private CreateEventService $createEventService;

    private CreateProductCategoryService $createProductCategoryService;

    private CreateQuestionService $createQuestionService;

    private EventRepositoryInterface $eventRepository;

    private CreateShopHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createEventService = m::mock(CreateEventService::class);
        $this->createProductCategoryService = m::mock(CreateProductCategoryService::class);
        $this->createQuestionService = m::mock(CreateQuestionService::class);
        $this->eventRepository = m::mock(EventRepositoryInterface::class);

        $organizerFetchService = m::mock(OrganizerFetchService::class);
        $organizerFetchService->shouldReceive('fetchOrganizer')->andReturn(
            (new OrganizerDomainObject)->setId(1)->setTimezone('Asia/Dubai')->setCurrency('AED')
        );

        $databaseManager = m::mock(DatabaseManager::class);
        $databaseManager->shouldReceive('transaction')->andReturnUsing(fn ($callback) => $callback());

        $this->handler = new CreateShopHandler(
            $this->createEventService,
            $organizerFetchService,
            $this->createProductCategoryService,
            $this->createQuestionService,
            $this->eventRepository,
            $databaseManager,
        );
    }

    public function test_uniform_shop_is_created_with_subcategories_and_collection_questions(): void
    {
        $this->createEventService->shouldReceive('createEvent')
            ->once()
            ->withArgs(function (EventDomainObject $event, ?string $startDate) {
                return $event->getIsShop() === true
                    && $event->getShopCategory() === 'UNIFORM'
                    && $event->getVendorType() === 'EXTERNAL'
                    && $event->getStatus() === 'DRAFT'
                    && $startDate !== null;
            })
            ->andReturn((new EventDomainObject)->setId(55));

        $categoryNames = [];
        $this->createProductCategoryService->shouldReceive('createCategory')
            ->times(4)
            ->andReturnUsing(function (ProductCategoryDomainObject $category) use (&$categoryNames) {
                $categoryNames[] = $category->getName();

                return $category;
            });

        $questionTitles = [];
        $this->createQuestionService->shouldReceive('createQuestion')
            ->twice()
            ->andReturnUsing(function (QuestionDomainObject $question, array $productIds) use (&$questionTitles) {
                $this->assertTrue($question->getRequired());
                $this->assertSame('ORDER', $question->getBelongsTo());
                $this->assertSame([], $productIds);
                $questionTitles[] = $question->getTitle();

                return $question;
            });

        $shop = $this->handler->handle($this->dto(ShopCategory::UNIFORM, ShopVendorType::EXTERNAL));

        $this->assertSame(55, $shop->getId());
        $this->assertSame(
            ['Regular uniform', 'Sports uniform - home', 'Sports uniform - away', 'House uniform'],
            $categoryNames,
        );
        $this->assertSame(['Student name', 'Student class or year'], $questionTitles);
    }

    public function test_second_meals_vendor_for_the_same_school_is_rejected(): void
    {
        $this->eventRepository->shouldReceive('findFirstWhere')
            ->once()
            ->with(['organizer_id' => 1, 'is_shop' => true, 'shop_category' => 'MEALS'])
            ->andReturn((new EventDomainObject)->setId(9));

        $this->createEventService->shouldNotReceive('createEvent');

        $this->expectException(ShopAlreadyExistsException::class);

        $this->handler->handle($this->dto(ShopCategory::MEALS, ShopVendorType::EXTERNAL));
    }

    public function test_first_meals_vendor_is_allowed(): void
    {
        $this->eventRepository->shouldReceive('findFirstWhere')->once()->andReturnNull();
        $this->createEventService->shouldReceive('createEvent')->once()->andReturn((new EventDomainObject)->setId(56));
        $this->createProductCategoryService->shouldReceive('createCategory')->once();
        $this->createQuestionService->shouldReceive('createQuestion')->twice();

        $this->assertSame(56, $this->handler->handle($this->dto(ShopCategory::MEALS, ShopVendorType::EXTERNAL))->getId());
    }

    private function dto(ShopCategory $category, ShopVendorType $vendorType): CreateShopDTO
    {
        return new CreateShopDTO(
            organizer_id: 1,
            account_id: 2,
            user_id: 3,
            title: 'Test shop',
            shop_category: $category,
            vendor_type: $vendorType,
        );
    }
}
