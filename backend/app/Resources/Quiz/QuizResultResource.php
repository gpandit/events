<?php

declare(strict_types=1);

namespace HiEvents\Resources\Quiz;

use HiEvents\DomainObjects\QuizResultDomainObject;
use HiEvents\Resources\BaseResource;

/**
 * @mixin QuizResultDomainObject
 */
class QuizResultResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->getId(),
            'age_band' => $this->getAgeBand(),
            'score' => $this->getScore(),
            'total_questions' => $this->getTotalQuestions(),
            'percentage' => $this->getPercentage(),
            'points' => $this->getPoints(),
            'taken_at' => $this->getTakenAt(),
        ];
    }
}
