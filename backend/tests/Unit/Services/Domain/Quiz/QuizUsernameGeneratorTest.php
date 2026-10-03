<?php

namespace Tests\Unit\Services\Domain\Quiz;

use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\DomainObjects\QuizUsernameCharacterDomainObject;
use HiEvents\Exceptions\QuizUsernameUnavailableException;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Repository\Interfaces\QuizUsernameCharacterRepositoryInterface;
use HiEvents\Services\Domain\Quiz\QuizUsernameGenerator;
use Mockery as m;
use Tests\TestCase;

class QuizUsernameGeneratorTest extends TestCase
{
    private QuizUsernameCharacterRepositoryInterface $characters;

    private QuizPlayerRepositoryInterface $players;

    private QuizUsernameGenerator $generator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->characters = m::mock(QuizUsernameCharacterRepositoryInterface::class);
        $this->players = m::mock(QuizPlayerRepositoryInterface::class);
        $this->generator = new QuizUsernameGenerator($this->characters, $this->players);
    }

    public function test_it_combines_a_character_name_with_a_two_or_three_digit_suffix(): void
    {
        $this->characters->shouldReceive('findRandom')->once()->andReturn((new QuizUsernameCharacterDomainObject)->setName('Simba'));
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn(null);

        $this->assertMatchesRegularExpression('/^Simba\d{2,3}$/', $this->generator->generate(1));
    }

    public function test_it_tries_again_when_the_username_is_taken(): void
    {
        $this->characters->shouldReceive('findRandom')->twice()->andReturn((new QuizUsernameCharacterDomainObject)->setName('Nemo'));
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn(new QuizPlayerDomainObject);
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn(null);

        $this->assertMatchesRegularExpression('/^Nemo\d{2,3}$/', $this->generator->generate(1));
    }

    public function test_it_fails_when_there_are_no_characters_to_choose_from(): void
    {
        $this->characters->shouldReceive('findRandom')->once()->andReturn(null);

        $this->expectException(QuizUsernameUnavailableException::class);

        $this->generator->generate(1);
    }

    public function test_it_fails_when_every_attempt_collides(): void
    {
        $this->characters->shouldReceive('findRandom')->andReturn((new QuizUsernameCharacterDomainObject)->setName('Dory'));
        $this->players->shouldReceive('findFirstWhere')->andReturn(new QuizPlayerDomainObject);

        $this->expectException(QuizUsernameUnavailableException::class);

        $this->generator->generate(1);
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
