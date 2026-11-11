<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\SlotBooking;

use HiEvents\DomainObjects\Status\WaitlistEntryStatus;
use HiEvents\DomainObjects\WaitlistEntryDomainObject;
use HiEvents\Exceptions\ResourceConflictException;
use HiEvents\Helper\EmailHelper;
use HiEvents\Repository\Interfaces\WaitlistEntryRepositoryInterface;
use HiEvents\Services\Domain\Waitlist\CancelWaitlistEntryService;

class SlotWaitlistEntryCanceller
{
    public function __construct(
        private readonly WaitlistEntryRepositoryInterface $waitlistEntryRepository,
        private readonly CancelWaitlistEntryService $cancelWaitlistEntryService,
    ) {}

    public function cancelFor(int $eventId, string $email): void
    {
        $entries = $this->waitlistEntryRepository->findWhere([
            'event_id' => $eventId,
            'email' => EmailHelper::normalize($email),
            ['status', 'in', [WaitlistEntryStatus::WAITING->name, WaitlistEntryStatus::OFFERED->name]],
        ]);

        /** @var WaitlistEntryDomainObject $entry */
        foreach ($entries as $entry) {
            try {
                $this->cancelWaitlistEntryService->cancelEntry($entry);
            } catch (ResourceConflictException) {
                continue;
            }
        }
    }
}
