<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\ParentalConsent;

use HiEvents\Exceptions\InvalidParentalConsentTokenException;
use HiEvents\Exceptions\ParentalConsentNotRespondableException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\ResponseCodes;
use HiEvents\Services\Application\Handlers\ParentalConsent\RespondToParentalConsentHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RespondToParentalConsentPublicAction extends BaseAction
{
    public function __construct(
        private readonly RespondToParentalConsentHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request, int $organizerId, string $token): JsonResponse
    {
        $data = $this->validate($request, [
            'granted' => 'required|boolean',
        ]);

        try {
            $this->handler->handle($organizerId, $token, $request->boolean('granted'));
        } catch (InvalidParentalConsentTokenException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_NOT_FOUND);
        } catch (ParentalConsentNotRespondableException $exception) {
            throw ValidationException::withMessages(['granted' => $exception->getMessage()]);
        }

        return $this->jsonResponse([
            'message' => $data['granted']
                ? __('Thank you. Your permission has been recorded.')
                : __('Thank you. Your response has been recorded and nothing will be shared.'),
        ]);
    }
}
