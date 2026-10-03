<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\QuizResult;

use HiEvents\DomainObjects\Generated\QuizResultDomainObjectAbstract;
use HiEvents\DomainObjects\QuizResultDomainObject;
use HiEvents\Repository\Interfaces\QuizResultRepositoryInterface;
use HiEvents\Services\Application\Handlers\QuizResult\DTO\SubmitQuizResultDTO;
use Illuminate\Support\Carbon;

class SubmitQuizResultHandler
{
    public function __construct(
        private readonly QuizResultRepositoryInterface $repository,
    ) {}

    public function handle(SubmitQuizResultDTO $dto): QuizResultDomainObject
    {
        /** @var QuizResultDomainObject $result */
        $result = $this->repository->create([
            QuizResultDomainObjectAbstract::ORGANIZER_ID => $dto->organizer_id,
            QuizResultDomainObjectAbstract::FIRST_NAME => trim($dto->first_name),
            QuizResultDomainObjectAbstract::LAST_NAME => trim($dto->last_name),
            QuizResultDomainObjectAbstract::EMAIL => mb_strtolower(trim($dto->email)),
            QuizResultDomainObjectAbstract::AGE_BAND => $dto->age_band,
            QuizResultDomainObjectAbstract::SCORE => $dto->score,
            QuizResultDomainObjectAbstract::TOTAL_QUESTIONS => $dto->total_questions,
            QuizResultDomainObjectAbstract::PERCENTAGE => (int) round($dto->score / $dto->total_questions * 100),
            QuizResultDomainObjectAbstract::TAKEN_AT => Carbon::now(),
        ]);

        return $result;
    }
}
