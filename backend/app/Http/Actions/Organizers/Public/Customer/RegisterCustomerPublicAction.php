<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Customer;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\Customer\DTO\RegisterCustomerDTO;
use HiEvents\Services\Application\Handlers\Customer\RegisterCustomerHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RegisterCustomerPublicAction extends BaseAction
{
    public function __construct(
        private readonly RegisterCustomerHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $request->merge(['organizer_id' => $organizerId]);

        $data = $this->validate($request, [
            'organizer_id' => 'required|exists:organizers,id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
        ]);

        $this->handler->handle(RegisterCustomerDTO::from([
            'organizer_id' => $organizerId,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
        ]));

        return $this->jsonResponse([
            'message' => __('Check your email for a link to finish creating your account.'),
        ]);
    }
}
