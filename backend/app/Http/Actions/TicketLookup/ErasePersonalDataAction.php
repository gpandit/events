<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\TicketLookup;

use HiEvents\Exceptions\InvalidCredentialsException;
use HiEvents\Exceptions\InvalidTicketLookupTokenException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\PersonalData\ErasePersonalDataHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ErasePersonalDataAction extends BaseAction
{
    public function __construct(
        private readonly ErasePersonalDataHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, string $token): JsonResponse
    {
        $data = $this->validate($request, [
            'confirmation' => 'required|in:DELETE',
            'password' => 'nullable|string|max:100',
        ]);

        try {
            $this->handler->handle($token, $data['password'] ?? null);
        } catch (InvalidTicketLookupTokenException $exception) {
            return $this->errorResponse(message: $exception->getMessage());
        } catch (InvalidCredentialsException $exception) {
            throw ValidationException::withMessages(['password' => $exception->getMessage()]);
        }

        return $this->jsonResponse([
            'message' => __('Your personal data has been deleted.'),
        ]);
    }
}
