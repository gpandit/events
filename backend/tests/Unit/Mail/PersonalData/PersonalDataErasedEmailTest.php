<?php

namespace Tests\Unit\Mail\PersonalData;

use HiEvents\Mail\PersonalData\PersonalDataErasedEmail;
use HiEvents\Services\Domain\PersonalData\DTO\PersonalDataErasureReportDTO;
use Tests\TestCase;

class PersonalDataErasedEmailTest extends TestCase
{
    public function test_the_email_explains_what_was_deleted_kept_and_out_of_our_control_without_the_requestors_email(): void
    {
        $report = new PersonalDataErasureReportDTO(['A1B2', 'C3D4'], 3, 1, 2, 1, 4, 5, '2026-10-05 10:00:00');

        $html = (new PersonalDataErasedEmail($report, 'help@example.com'))->render();

        $this->assertStringContainsString('Your personal data has been deleted', $html);
        $this->assertStringContainsString('#A1B2, #C3D4', $html);
        $this->assertStringContainsString('2026-10-05 10:00:00', $html);
        $this->assertStringContainsString('What we kept', $html);
        $this->assertStringContainsString('Stripe', $html);
        $this->assertStringContainsString('Backups', $html);
        $this->assertStringContainsString('Event organizers', $html);
        $this->assertStringContainsString('help@example.com', $html);
    }

    public function test_the_order_references_section_is_omitted_when_no_orders_were_affected(): void
    {
        $report = new PersonalDataErasureReportDTO([], 0, 0, 0, 0, 1, 1, '2026-10-05 10:00:00');

        $html = (new PersonalDataErasedEmail($report, 'help@example.com'))->render();

        $this->assertStringNotContainsString('The orders affected are', $html);
    }
}
