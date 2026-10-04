<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Organizers\Public\ParentalConsent;

use HiEvents\Exceptions\InvalidParentalConsentTokenException;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Http\ResponseCodes;
use HiEvents\Services\Application\Handlers\ParentalConsent\GetParentalConsentHandler;
use Illuminate\Http\JsonResponse;

class GetParentalConsentPublicAction extends BaseAction
{
    public function __construct(
        private readonly GetParentalConsentHandler $handler,
    ) {}

    public function __invoke(int $organizerId, string $token): JsonResponse
    {
        try {
            $details = $this->handler->handle($organizerId, $token);
        } catch (InvalidParentalConsentTokenException $exception) {
            return $this->errorResponse($exception->getMessage(), ResponseCodes::HTTP_NOT_FOUND);
        }

        return $this->jsonResponse($details->toArray(), wrapInData: true);
    }
}
