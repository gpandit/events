<?php

declare(strict_types=1);

namespace HiEvents\Http\Request\ColouringPage;

use HiEvents\DomainObjects\Enums\ColouringPageAgeGroup;
use HiEvents\DomainObjects\Enums\ColouringPageTint;
use HiEvents\DomainObjects\Status\ColouringPageStatus;
use HiEvents\Http\Request\BaseRequest;
use Illuminate\Validation\Rule;

class CreateColouringPageRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'age_group' => ['required', Rule::in(ColouringPageAgeGroup::valuesArray())],
            'tint' => ['required', Rule::in(ColouringPageTint::valuesArray())],
            'status' => ['required', Rule::in(ColouringPageStatus::valuesArray())],
            'pdf' => ['required', 'file', 'mimes:pdf', 'mimetypes:application/pdf', 'max:10240'],
            'thumbnail' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:1024'],
        ];
    }
}
