<?php

namespace Tests\Unit\Services\Application\Handlers\QuizResult;

use HiEvents\DomainObjects\QuizResultDomainObject;
use HiEvents\Repository\Interfaces\QuizResultRepositoryInterface;
use HiEvents\Services\Application\Handlers\QuizResult\DTO\SubmitQuizResultDTO;
use HiEvents\Services\Application\Handlers\QuizResult\SubmitQuizResultHandler;
use Mockery as m;
use Tests\TestCase;

class SubmitQuizResultHandlerTest extends TestCase
{
    private QuizResultRepositoryInterface $repository;

    private SubmitQuizResultHandler $handler;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = m::mock(QuizResultRepositoryInterface::class);
        $this->handler = new SubmitQuizResultHandler($this->repository);
    }

    public function test_handle_stores_a_normalised_result_with_a_calculated_percentage(): void
    {
        $dto = new SubmitQuizResultDTO(
            organizer_id: 10,
            first_name: '  Amelia ',
            last_name: 'Khan  ',
            email: '  Amelia.Khan@Example.COM ',
            age_band: '8-10',
            score: 17,
            total_questions: 20,
        );

        $expected = m::mock(QuizResultDomainObject::class);

        $this->repository
            ->shouldReceive('create')
            ->once()
            ->with(m::on(function (array $attributes) {
                return $attributes['organizer_id'] === 10
                    && $attributes['first_name'] === 'Amelia'
                    && $attributes['last_name'] === 'Khan'
                    && $attributes['email'] === 'amelia.khan@example.com'
                    && $attributes['age_band'] === '8-10'
                    && $attributes['score'] === 17
                    && $attributes['total_questions'] === 20
                    && $attributes['percentage'] === 85
                    && isset($attributes['taken_at']);
            }))
            ->andReturn($expected);

        $this->assertSame($expected, $this->handler->handle($dto));
    }

    protected function tearDown(): void
    {
        m::close();
        parent::tearDown();
    }
}
