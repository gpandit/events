<?php

namespace HiEvents\Http\Actions\Shops;

use HiEvents\Exceptions\OrganizerNotFoundException;
use HiEvents\Exceptions\ShopAlreadyExistsException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\Request\Shop\CreateShopRequest;
use HiEvents\Resources\Event\EventResource;
use HiEvents\Services\Application\Handlers\Shop\CreateShopHandler;
use HiEvents\Services\Application\Handlers\Shop\DTO\CreateShopDTO;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Throwable;

class CreateShopAction extends BaseAction
{
    public function __construct(
        private readonly CreateShopHandler $createShopHandler,
    ) {}

    /**
     * @throws ValidationException|Throwable
     */
    public function __invoke(CreateShopRequest $request): JsonResponse
    {
        try {
            $shop = $this->createShopHandler->handle(CreateShopDTO::from([
                ...$request->validated(),
                'account_id' => $this->getAuthenticatedAccountId(),
                'user_id' => $this->getAuthenticatedUser()->getId(),
            ]));
        } catch (OrganizerNotFoundException $e) {
            throw ValidationException::withMessages(['organizer_id' => $e->getMessage()]);
        } catch (ShopAlreadyExistsException $e) {
            throw ValidationException::withMessages(['shop_category' => $e->getMessage()]);
        }

        return $this->resourceResponse(EventResource::class, $shop, statusCode: 201);
    }
}
