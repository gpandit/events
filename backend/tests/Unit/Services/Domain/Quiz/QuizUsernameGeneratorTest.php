<?php

namespace Tests\Unit\Services\Domain\Quiz;

use HiEvents\DomainObjects\QuizPlayerDomainObject;
use HiEvents\DomainObjects\QuizUsernameCharacterDomainObject;
use HiEvents\Exceptions\QuizUsernameTakenException;
use HiEvents\Exceptions\QuizUsernameUnavailableException;
use HiEvents\Repository\Interfaces\QuizPlayerRepositoryInterface;
use HiEvents\Repository\Interfaces\QuizUsernameCharacterRepositoryInterface;
use HiEvents\Services\Domain\Quiz\QuizUsernameGenerator;
use Illuminate\Support\Collection;
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

    private function characters(string ...$names): Collection
    {
        return collect($names)->map(fn (string $name) => (new QuizUsernameCharacterDomainObject)->setName($name));
    }

    public function test_it_offers_one_username_per_character_with_a_two_or_three_digit_suffix(): void
    {
        $this->characters->shouldReceive('findRandomMany')->once()->with(10)->andReturn($this->characters('Simba', 'Nemo', 'Dory'));
        $this->players->shouldReceive('findFirstWhere')->times(3)->andReturn(null);

        $options = $this->generator->generateOptions(1);

        $this->assertCount(3, $options);
        $this->assertMatchesRegularExpression('/^Simba\d{2,3}$/', $options[0]);
        $this->assertMatchesRegularExpression('/^Nemo\d{2,3}$/', $options[1]);
        $this->assertMatchesRegularExpression('/^Dory\d{2,3}$/', $options[2]);
    }

    public function test_it_tries_another_number_when_the_username_is_taken(): void
    {
        $this->characters->shouldReceive('findRandomMany')->once()->andReturn($this->characters('Nemo'));
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn(new QuizPlayerDomainObject);
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn(null);

        $this->assertCount(1, $this->generator->generateOptions(1));
    }

    public function test_it_leaves_out_a_character_whose_usernames_keep_colliding(): void
    {
        $this->characters->shouldReceive('findRandomMany')->once()->andReturn($this->characters('Dory', 'Nemo'));
        $this->players->shouldReceive('findFirstWhere')->times(5)->andReturn(new QuizPlayerDomainObject);
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn(null);

        $options = $this->generator->generateOptions(1);

        $this->assertCount(1, $options);
        $this->assertStringStartsWith('Nemo', $options[0]);
    }

    public function test_it_fails_when_there_are_no_characters_to_choose_from(): void
    {
        $this->characters->shouldReceive('findRandomMany')->once()->andReturn(collect());

        $this->expectException(QuizUsernameUnavailableException::class);

        $this->generator->generateOptions(1);
    }

    public function test_a_free_username_built_from_a_known_character_can_be_chosen(): void
    {
        $this->characters->shouldReceive('findFirstWhere')->once()->andReturn((new QuizUsernameCharacterDomainObject)->setName('Simba'));
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn(null);

        $this->generator->assertChoosable(1, 'Simba42');

        $this->addToAssertionCount(1);
    }

    public function test_a_taken_username_cannot_be_chosen(): void
    {
        $this->characters->shouldReceive('findFirstWhere')->once()->andReturn((new QuizUsernameCharacterDomainObject)->setName('Simba'));
        $this->players->shouldReceive('findFirstWhere')->once()->andReturn(new QuizPlayerDomainObject);

        $this->expectException(QuizUsernameTakenException::class);

        $this->generator->assertChoosable(1, 'Simba42');
    }

    public function test_a_username_from_an_unknown_character_cannot_be_chosen(): void
    {
        $this->characters->shouldReceive('findFirstWhere')->once()->andReturn(null);

        $this->expectException(QuizUsernameTakenException::class);

        $this->generator->assertChoosable(1, 'Nobody42');
    }

    public function test_a_username_without_a_number_suffix_cannot_be_chosen(): void
    {
        $this->expectException(QuizUsernameTakenException::class);

        $this->generator->assertChoosable(1, 'Simba');
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
