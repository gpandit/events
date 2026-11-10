<?php

declare(strict_types=1);

namespace HiEvents\Services\Application\Handlers\EventOccurrence;

use HiEvents\Repository\Interfaces\EventRepositoryInterface;
use HiEvents\Services\Application\Handlers\EventOccurrence\DTO\GenerateSlotsDTO;
use HiEvents\Services\Domain\EventOccurrence\SlotGeneratorService;
use Throwable;

class GenerateSlotsHandler
{
    public function __construct(
        private readonly EventRepositoryInterface $eventRepository,
        private readonly SlotGeneratorService $slotGeneratorService,
    ) {}

    /**
     * @throws Throwable
     */
    public function handle(GenerateSlotsDTO $dto): int
    {
        $event = $this->eventRepository->findById($dto->event_id);

        return $this->slotGeneratorService->generate($event, $dto);
    }
}
