<?php

namespace HiEvents\Http\Actions\Public;

use HiEvents\Http\Actions\BaseAction;
use HiEvents\Services\Application\Handlers\Contact\DTO\SubmitSiteContactMessageDTO;
use HiEvents\Services\Application\Handlers\Contact\SubmitSiteContactMessageHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SubmitSiteContactMessageAction extends BaseAction
{
    public function __construct(
        private readonly SubmitSiteContactMessageHandler $handler,
    ) {}

    /**
     * @throws ValidationException
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $this->validate($request, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $this->handler->handle(SubmitSiteContactMessageDTO::from([
            'name' => $data['name'],
            'email' => $data['email'],
            'message' => $data['message'],
        ]));

        return $this->jsonResponse([
            'message' => __('Message sent successfully'),
        ]);
    }
}
