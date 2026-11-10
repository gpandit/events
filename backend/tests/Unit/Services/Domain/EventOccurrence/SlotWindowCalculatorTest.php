<?php

declare(strict_types=1);

namespace Tests\Unit\Services\Domain\EventOccurrence;

use HiEvents\Exceptions\InvalidSlotConfigurationException;
use HiEvents\Services\Domain\EventOccurrence\SlotWindowCalculator;
use Tests\TestCase;

class SlotWindowCalculatorTest extends TestCase
{
    private SlotWindowCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new SlotWindowCalculator();
    }

    public function testGeneratesFortyEightFiveMinuteSlotsForTheDefaultWindow(): void
    {
        $slots = $this->calculator->slots('2026-12-10', '18:00', '22:00', 5, 'Europe/London');

        $this->assertCount(48, $slots);
        $this->assertSame('2026-12-10 18:00:00', $slots[0]['start']->format('Y-m-d H:i:s'));
        $this->assertSame('2026-12-10 18:05:00', $slots[0]['end']->format('Y-m-d H:i:s'));
        $this->assertSame('2026-12-10 21:55:00', $slots[47]['start']->format('Y-m-d H:i:s'));
        $this->assertSame('2026-12-10 22:00:00', $slots[47]['end']->format('Y-m-d H:i:s'));
    }

    public function testSlotsCarryTheRequestedTimezone(): void
    {
        $slots = $this->calculator->slots('2026-07-10', '18:00', '19:00', 30, 'Europe/London');

        $this->assertSame('2026-07-10 17:00:00', $slots[0]['start']->utc()->format('Y-m-d H:i:s'));
    }

    public function testRejectsWindowThatSlotLengthDoesNotDivide(): void
    {
        $this->expectException(InvalidSlotConfigurationException::class);

        $this->calculator->slots('2026-12-10', '18:00', '18:10', 3, 'Europe/London');
    }

    public function testRejectsEndBeforeStart(): void
    {
        $this->expectException(InvalidSlotConfigurationException::class);

        $this->calculator->slots('2026-12-10', '22:00', '18:00', 5, 'Europe/London');
    }

    public function testRejectsSlotLengthOutsideAllowedRange(): void
    {
        $this->expectException(InvalidSlotConfigurationException::class);
        $this->calculator->slots('2026-12-10', '18:00', '22:00', 0, 'Europe/London');
    }

    public function testRejectsSlotLengthAboveMaximum(): void
    {
        $this->expectException(InvalidSlotConfigurationException::class);
        $this->calculator->slots('2026-12-10', '00:00', '23:59', 241, 'Europe/London');
    }

    public function testRejectsMalformedTimes(): void
    {
        $this->expectException(InvalidSlotConfigurationException::class);

        $this->calculator->slots('2026-12-10', '6pm', '22:00', 5, 'Europe/London');
    }
}
