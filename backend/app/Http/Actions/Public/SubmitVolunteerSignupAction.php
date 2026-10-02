<?php

namespace HiEvents\Http\Actions\Public;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\Contact\DTO\SubmitVolunteerSignupDTO;
use HiEvents\Services\Application\Handlers\Contact\SubmitVolunteerSignupHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SubmitVolunteerSignupAction extends BaseAction
{
    public function __construct(
        private readonly SubmitVolunteerSignupHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $this->validate($request, [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'message' => 'nullable|string|max:5000',
        ]);

        $this->handler->handle(SubmitVolunteerSignupDTO::from([
            'firstName' => $data['first_name'],
            'lastName' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'message' => $data['message'] ?? null,
        ]));

        return $this->jsonResponse([
            'message' => __('Thank you for volunteering! We will be in touch soon.'),
        ]);
    }
}
