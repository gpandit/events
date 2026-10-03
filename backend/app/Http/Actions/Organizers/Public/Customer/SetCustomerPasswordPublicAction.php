<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\Customer;

use HiEvents\Exceptions\InvalidPasswordSetupTokenException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\Customer\DTO\SetCustomerPasswordDTO;
use HiEvents\Services\Application\Handlers\Customer\SetCustomerPasswordHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SetCustomerPasswordPublicAction extends BaseAction
{
    public function __construct(
        private readonly SetCustomerPasswordHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId): JsonResponse
    {
        $data = $this->validate($request, [
            'token' => 'required|string|max:100',
            'password' => 'required|string|min:8|max:100',
        ]);

        try {
            $session = $this->handler->handle(SetCustomerPasswordDTO::from([
                'organizer_id' => $organizerId,
                'token' => $data['token'],
                'password' => $data['password'],
            ]));
        } catch (InvalidPasswordSetupTokenException $exception) {
            throw ValidationException::withMessages(['token' => $exception->getMessage()]);
        }

        return $this->jsonResponse($session->toArray(), wrapInData: true);
    }
}
