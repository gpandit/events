<?php

namespace Tests\Unit\Database;

use Tests\TestCase;

class QuizUsernameCharactersDataTest extends TestCase
{
    private array $names;

    protected function setUp(): void
    {
        parent::setUp();

        $this->names = require database_path('data/quiz_username_characters.php');
    }

    public function test_the_pool_has_at_least_five_hundred_characters(): void
    {
        $this->assertGreaterThanOrEqual(500, count($this->names));
    }

    public function test_names_are_unique_ignoring_case(): void
    {
        $lowered = array_map('mb_strtolower', $this->names);

        $this->assertCount(count($lowered), array_unique($lowered));
    }

    public function test_names_are_single_alphanumeric_words_that_fit_the_column(): void
    {
        foreach ($this->names as $name) {
            $this->assertMatchesRegularExpression('/^[A-Za-z][A-Za-z0-9]{2,40}$/', $name, $name);
        }
    }
}
