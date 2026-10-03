<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Customer;

use HiEvents\Exceptions\InvalidCredentialsException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\ResponseCodes;
use HiEvents\Services\Application\Handlers\Customer\DTO\LoginCustomerDTO;
use HiEvents\Services\Application\Handlers\Customer\LoginCustomerHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LoginCustomerPublicAction extends BaseAction
{
    public function __construct(
        private readonly LoginCustomerHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $data = $this->validate($request, [
            'email' => 'required|email|max:255',
            'password' => 'required|string|max:100',
        ]);

        try {
            $session = $this->handler->handle(LoginCustomerDTO::from([
                'organizer_id' => $organizerId,
                'email' => $data['email'],
                'password' => $data['password'],
            ]));
        } catch (InvalidCredentialsException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_UNAUTHORIZED);
        }

        return $this->jsonResponse($session->toArray(), wrapInData: true);
    }
}
