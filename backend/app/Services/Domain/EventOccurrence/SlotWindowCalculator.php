<?php

declare(strict_types=1);

namespace HiEvents\Services\Domain\EventOccurrence;

use Carbon\CarbonImmutable;
use HiEvents\Exceptions\InvalidSlotConfigurationException;

class SlotWindowCalculator
{
    public const MIN_SLOT_MINUTES = 1;

    public const MAX_SLOT_MINUTES = 240;

    private const TIME_PATTERN = '/^([01]\d|2[0-3]):[0-5]\d$/';

    /**
     * @return list<array{start: CarbonImmutable, end: CarbonImmutable}>
     *
     * @throws InvalidSlotConfigurationException
     */
    public function slots(
        string $date,
        string $startTime,
        string $endTime,
        int $slotMinutes,
        string $timezone,
    ): array {
        if ($slotMinutes < self::MIN_SLOT_MINUTES || $slotMinutes > self::MAX_SLOT_MINUTES) {
            throw new InvalidSlotConfigurationException(
                __('Slot length must be between :min and :max minutes', [
                    'min' => self::MIN_SLOT_MINUTES,
                    'max' => self::MAX_SLOT_MINUTES,
                ])
            );
        }

        if (! preg_match(self::TIME_PATTERN, $startTime) || ! preg_match(self::TIME_PATTERN, $endTime)) {
            throw new InvalidSlotConfigurationException(__('Times must be in HH:MM 24-hour format'));
        }

        $start = CarbonImmutable::parse("$date $startTime", $timezone);
        $end = CarbonImmutable::parse("$date $endTime", $timezone);

        if ($end->lessThanOrEqualTo($start)) {
            throw new InvalidSlotConfigurationException(__('End time must be after start time'));
        }

        $windowMinutes = (int) $start->diffInMinutes($end);

        if ($windowMinutes % $slotMinutes !== 0) {
            throw new InvalidSlotConfigurationException(
                __('The time window must divide evenly into slots of :minutes minutes', ['minutes' => $slotMinutes])
            );
        }

        $slots = [];
        for ($cursor = $start; $cursor->lessThan($end); $cursor = $cursor->addMinutes($slotMinutes)) {
            $slots[] = ['start' => $cursor, 'end' => $cursor->addMinutes($slotMinutes)];
        }

        return $slots;
    }
}
