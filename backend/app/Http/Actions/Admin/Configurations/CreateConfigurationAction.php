<?php

declare(strict_types=1);

namespace HiEvents\Http\Actions\Admin\Configurations;

use HiEvents\DomainObjects\Enums\PaymentProcessingFeeMode;
use HiEvents\DomainObjects\Enums\Role;
use HiEvents\Http\Actions\BaseAction;
use HiEvents\Repository\Interfaces\OrganizerConfigurationRepositoryInterface;
use HiEvents\Resources\Organizer\OrganizerConfigurationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class CreateConfigurationAction extends BaseAction
{
    public function __construct(
        private readonly OrganizerConfigurationRepositoryInterface $repository,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $this->minimumAllowedRole(Role::SUPERADMIN);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'application_fees' => 'required|array',
            'application_fees.fixed' => 'required|numeric|min:0',
            'application_fees.percentage' => 'required|numeric|min:0|max:100',
            'application_fees.currency' => 'sometimes|string|size:3|alpha|uppercase',
            'bypass_application_fees' => 'sometimes|boolean',
            'payment_processing_fee_mode' => ['sometimes', Rule::in(PaymentProcessingFeeMode::valuesArray())],
        ]);

        $configuration = $this->repository->create([
            'name' => $validated['name'],
            'is_system_default' => false,
            'application_fees' => $validated['application_fees'],
            'bypass_application_fees' => $validated['bypass_application_fees'] ?? false,
            'payment_processing_fee_mode' => $validated['payment_processing_fee_mode'] ?? PaymentProcessingFeeMode::HIDE->value,
        ]);

        return $this->jsonResponse(
            new OrganizerConfigurationResource($configuration),
            statusCode: Response::HTTP_CREATED,
            wrapInData: true
        );
    }
}
