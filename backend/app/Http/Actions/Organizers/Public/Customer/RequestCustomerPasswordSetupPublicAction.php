<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Customer;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\Customer\DTO\RequestCustomerPasswordSetupDTO;
use HiEvents\Services\Application\Handlers\Customer\RequestCustomerPasswordSetupHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RequestCustomerPasswordSetupPublicAction extends BaseAction
{
    public function __construct(
        private readonly RequestCustomerPasswordSetupHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $data = $this->validate($request, [
            'email' => 'required|email|max:255',
        ]);

        $this->handler->handle(RequestCustomerPasswordSetupDTO::from([
            'organizer_id' => $organizerId,
            'email' => $data['email'],
        ]));

        return $this->jsonResponse([
            'message' => __('If an account exists for that email, we have sent a link to reset the password.'),
        ]);
    }
}
