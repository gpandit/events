<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\ParentalConsent;

use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\Generated\ParentalConsentDomainObjectAbstract;
use HiEvents\DomainObjects\ParentalConsentDomainObject;
use HiEvents\DomainObjects\Status\ParentalConsentStatus;
use HiEvents\Exceptions\InvalidParentalConsentTokenException;
use HiEvents\Exceptions\ParentalConsentNotRespondableException;
use HiEvents\Repository\Interfaces\ParentalConsentRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ParentalConsentService
{
    public const LIFETIME_DAYS = 14;

    public function __construct(
        private readonly ParentalConsentRepositoryInterface $repository,
    ) {}

    public function request(
        int $organizerId,
        ParentalConsentSubject $subject,
        int $subjectId,
        string $parentEmail,
    ): string {
        $token = Str::random(48);

        $this->repository->deleteWhere([
            ParentalConsentDomainObjectAbstract::SUBJECT_TYPE => $subject->value,
            ParentalConsentDomainObjectAbstract::SUBJECT_ID => $subjectId,
        ]);

        $this->repository->create([
            ParentalConsentDomainObjectAbstract::ORGANIZER_ID => $organizerId,
            ParentalConsentDomainObjectAbstract::SUBJECT_TYPE => $subject->value,
            ParentalConsentDomainObjectAbstract::SUBJECT_ID => $subjectId,
            ParentalConsentDomainObjectAbstract::PARENT_EMAIL => mb_strtolower(trim($parentEmail)),
            ParentalConsentDomainObjectAbstract::TOKEN_HASH => $this->hash($token),
            ParentalConsentDomainObjectAbstract::STATUS => ParentalConsentStatus::PENDING->value,
            ParentalConsentDomainObjectAbstract::REQUESTED_AT => Carbon::now(),
            ParentalConsentDomainObjectAbstract::EXPIRES_AT => Carbon::now()->addDays(self::LIFETIME_DAYS),
        ]);

        return $token;
    }

    /**
     * @throws InvalidParentalConsentTokenException
     */
    public function findByToken(int $organizerId, string $token): ParentalConsentDomainObject
    {
        /** @var ParentalConsentDomainObject|null $consent */
        $consent = $this->repository->findFirstWhere([
            ParentalConsentDomainObjectAbstract::ORGANIZER_ID => $organizerId,
            ParentalConsentDomainObjectAbstract::TOKEN_HASH => $this->hash($token),
        ]);

        if ($consent === null) {
            throw new InvalidParentalConsentTokenException(__('This link is invalid. Please check the link in the email we sent you.'));
        }

        return $consent;
    }

    /**
     * @throws ParentalConsentNotRespondableException
     */
    public function respond(ParentalConsentDomainObject $consent, bool $granted): ParentalConsentDomainObject
    {
        if (! $consent->isPending()) {
            throw new ParentalConsentNotRespondableException(__('A response has already been recorded for this request.'));
        }

        if ($consent->isExpired()) {
            throw new ParentalConsentNotRespondableException(__('This link has expired. Please ask for a new request to be sent.'));
        }

        /** @var ParentalConsentDomainObject $updated */
        $updated = $this->repository->updateFromArray($consent->getId(), [
            ParentalConsentDomainObjectAbstract::STATUS => $granted
                ? ParentalConsentStatus::GRANTED->value
                : ParentalConsentStatus::DECLINED->value,
            ParentalConsentDomainObjectAbstract::RESPONDED_AT => Carbon::now(),
        ]);

        return $updated;
    }

    public function findForSubject(ParentalConsentSubject $subject, int $subjectId): ?ParentalConsentDomainObject
    {
        /** @var ParentalConsentDomainObject|null $consent */
        $consent = $this->repository->findFirstWhere([
            ParentalConsentDomainObjectAbstract::SUBJECT_TYPE => $subject->value,
            ParentalConsentDomainObjectAbstract::SUBJECT_ID => $subjectId,
        ]);

        return $consent;
    }

    /**
     * @param  int[]  $subjectIds
     * @return Collection<int, ParentalConsentDomainObject> keyed by subject id
     */
    public function findForSubjects(ParentalConsentSubject $subject, array $subjectIds): Collection
    {
        return $this->repository
            ->findWhereIn(
                field: ParentalConsentDomainObjectAbstract::SUBJECT_ID,
                values: $subjectIds,
                additionalWhere: [ParentalConsentDomainObjectAbstract::SUBJECT_TYPE => $subject->value],
            )
            ->keyBy(fn (ParentalConsentDomainObject $consent) => $consent->getSubjectId());
    }

    private function hash(string $token): string
    {
        return hash('sha256', $token);
    }
}
