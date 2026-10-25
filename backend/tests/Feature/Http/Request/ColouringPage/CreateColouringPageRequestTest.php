<?php

namespace Tests\Feature\Http\Request\ColouringPage;

use HiEvents\Http\Request\ColouringPage\CreateColouringPageRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class CreateColouringPageRequestTest extends TestCase
{
    public function test_thumbnail_up_to_two_megabytes_passes_the_size_rule(): void
    {
        $rules = ['thumbnail' => $this->sizeRule()];

        $this->assertFalse(Validator::make(
            ['thumbnail' => UploadedFile::fake()->create('thumbnail.webp', 2048)],
            $rules
        )->errors()->has('thumbnail'));
    }

    public function test_thumbnail_over_two_megabytes_fails_the_size_rule(): void
    {
        $rules = ['thumbnail' => $this->sizeRule()];

        $this->assertTrue(Validator::make(
            ['thumbnail' => UploadedFile::fake()->create('thumbnail.webp', 2049)],
            $rules
        )->errors()->has('thumbnail'));
    }

    private function sizeRule(): string
    {
        return collect((new CreateColouringPageRequest)->rules()['thumbnail'])
            ->first(static fn (mixed $rule) => is_string($rule) && str_starts_with($rule, 'max:'));
    }
}
