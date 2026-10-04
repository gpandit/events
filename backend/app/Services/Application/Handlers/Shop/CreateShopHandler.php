<?php

namespace HiEvents\Services\Application\Handlers\Shop;

use HiEvents\DomainObjects\Enums\EventCategory;
use HiEvents\DomainObjects\Enums\EventType;
use HiEvents\DomainObjects\Enums\QuestionBelongsTo;
use HiEvents\DomainObjects\Enums\QuestionTypeEnum;
use HiEvents\DomainObjects\Enums\ShopCategory;
use HiEvents\DomainObjects\EventDomainObject;
use HiEvents\DomainObjects\ProductCategoryDomainObject;
use HiEvents\DomainObjects\QuestionDomainObject;
use HiEvents\DomainObjects\Status\EventStatus;
use HiEvents\Exceptions\OrganizerNotFoundException;
use HiEvents\Exceptions\ShopAlreadyExistsException;
use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Services\Application\Handlers\Shop\DTO\CreateShopDTO;
use HiEvents\Services\Domain\Event\CreateEventService;
use HiEvents\Services\Domain\Organizer\OrganizerFetchService;
use HiEvents\Services\Domain\ProductCategory\CreateProductCategoryService;
use HiEvents\Services\Domain\Question\CreateQuestionService;
use Illuminate\Database\DatabaseManager;
use Throwable;

class CreateShopHandler
{
    private const SHOP_OPEN_YEARS = 50;

    public function __construct(
        private readonly CreateEventService $createEventService,
        private readonly OrganizerFetchService $organizerFetchService,
        private readonly CreateProductCategoryService $createProductCategoryService,
        private readonly CreateQuestionService $createQuestionService,
        private readonly EventRepositoryInterface $eventRepository,
        private readonly DatabaseManager $databaseManager,
    ) {}

    /**
     * @throws OrganizerNotFoundException
     * @throws ShopAlreadyExistsException
     * @throws Throwable
     */
    public function handle(CreateShopDTO $dto): EventDomainObject
    {
        return $this->databaseManager->transaction(fn () => $this->createShop($dto));
    }

    /**
     * @throws OrganizerNotFoundException
     * @throws ShopAlreadyExistsException
     * @throws Throwable
     */
    private function createShop(CreateShopDTO $dto): EventDomainObject
    {
        $organizer = $this->organizerFetchService->fetchOrganizer(
            organizerId: $dto->organizer_id,
            accountId: $dto->account_id,
        );

        if ($dto->shop_category === ShopCategory::MEALS && $this->eventRepository->findFirstWhere([
            'organizer_id' => $dto->organizer_id,
            'is_shop' => true,
            'shop_category' => ShopCategory::MEALS->value,
        ]) !== null) {
            throw new ShopAlreadyExistsException(__('This school already has a school meals vendor'));
        }

        $event = (new EventDomainObject)
            ->setOrganizerId($dto->organizer_id)
            ->setAccountId($dto->account_id)
            ->setUserId($dto->user_id)
            ->setTitle($dto->title)
            ->setDescription($dto->description)
            ->setTimezone($organizer->getTimezone())
            ->setCurrency($organizer->getCurrency())
            ->setCategory(EventCategory::OTHER->value)
            ->setStatus(EventStatus::DRAFT->name)
            ->setType(EventType::SINGLE->name)
            ->setIsShop(true)
            ->setShopCategory($dto->shop_category->value)
            ->setVendorType($dto->vendor_type->value);

        $shop = $this->createEventService->createEvent(
            eventData: $event,
            startDate: now($organizer->getTimezone())->toDateTimeString(),
            endDate: now($organizer->getTimezone())->addYears(self::SHOP_OPEN_YEARS)->toDateTimeString(),
        );

        $this->createProductCategories($shop, $dto->shop_category);
        $this->createCollectionQuestions($shop);

        return $shop;
    }

    private function createProductCategories(EventDomainObject $shop, ShopCategory $shopCategory): void
    {
        foreach ($shopCategory->defaultProductCategoryNames() as $name) {
            $this->createProductCategoryService->createCategory((new ProductCategoryDomainObject)
                ->setEventId($shop->getId())
                ->setName($name)
                ->setIsHidden(false)
                ->setNoProductsMessage(__('There are no items available in this shop'))
            );
        }
    }

    /**
     * @throws Throwable
     */
    private function createCollectionQuestions(EventDomainObject $shop): void
    {
        foreach ([__('Student name'), __('Student class or year')] as $title) {
            $this->createQuestionService->createQuestion(
                question: (new QuestionDomainObject)
                    ->setEventId($shop->getId())
                    ->setTitle($title)
                    ->setBelongsTo(QuestionBelongsTo::ORDER->name)
                    ->setType(QuestionTypeEnum::SINGLE_LINE_TEXT->name)
                    ->setRequired(true)
                    ->setIsHidden(false)
                    ->setOptions(null)
                    ->setDescription(null),
                productIds: [],
            );
        }
    }
}
