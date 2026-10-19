import {t, Trans} from "@lingui/macro";
import {LegalPageLayout} from "../../../common/LegalPageLayout";

const UPDATED_DATE = "October 19, 2026";

export const RefundPolicy = () => {
    return (
        <LegalPageLayout title={t`Refund and Cancellation Policy`} updatedDate={UPDATED_DATE}>
            <p>
                <Trans>
                    This policy explains how refunds and cancellations work for tickets bought through this website,
                    which is operated by Aqualeo Digecom FZ-LLC ("Aqualeo Digecom", "we", "us", or "our").
                </Trans>
            </p>

            <h2><Trans>1. General rule</Trans></h2>
            <p>
                <Trans>
                    Unless the event page says otherwise, all ticket sales are final. Tickets are for a specific
                    date and time, so they are not covered by a cooling-off period. If an event page states its own
                    refund terms, those terms apply to that event and take priority over this policy.
                </Trans>
            </p>

            <h2><Trans>2. Event cancelled by the organizer</Trans></h2>
            <p>
                <Trans>
                    If an event is cancelled you will receive a full refund of the ticket price, including booking
                    fees. We will notify you by email and refund your original payment method within 5 to 10
                    business days. Your bank may take longer to show the refund on your statement.
                </Trans>
            </p>

            <h2><Trans>3. Event postponed or rescheduled</Trans></h2>
            <p>
                <Trans>
                    If an event is postponed or rescheduled, your ticket remains valid for the new date. If you
                    cannot attend the new date, you may request a refund within 14 days of the change being
                    announced.
                </Trans>
            </p>

            <h2><Trans>4. Event materially changed</Trans></h2>
            <p>
                <Trans>
                    If the venue, date or main programme of an event changes significantly, you may request a
                    refund within 14 days of the change being announced.
                </Trans>
            </p>

            <h2><Trans>5. Cancellation by you</Trans></h2>
            <p>
                <Trans>
                    If you are unable to attend, you may request a refund at least 7 days before the event. Approved
                    requests are refunded less any payment-processing fees. Requests made less than 7 days before
                    the event are not refunded.
                </Trans>
            </p>

            <h2><Trans>6. Duplicate or incorrect charges</Trans></h2>
            <p>
                <Trans>
                    If you were charged twice or charged the wrong amount, contact us and we will refund the
                    difference in full.
                </Trans>
            </p>

            <h2><Trans>7. How to request a refund</Trans></h2>
            <p>
                <Trans>
                    Email <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a> with your order reference, the email
                    address used at purchase and the reason for your request. We will reply within 3 business days.
                </Trans>
            </p>

            <h2><Trans>8. Refund method and timing</Trans></h2>
            <p>
                <Trans>
                    Refunds are made to the original payment method only. Once a refund is approved it is processed
                    within 5 to 10 business days.
                </Trans>
            </p>

            <h2><Trans>9. Please contact us first</Trans></h2>
            <p>
                <Trans>
                    If something is wrong with your order, please email us before raising a dispute with your bank
                    or card issuer. We can usually resolve issues faster directly, and we will investigate every
                    request promptly.
                </Trans>
            </p>

            <h2><Trans>10. Contact us</Trans></h2>
            <p>
                <Trans>
                    Aqualeo Digecom FZ-LLC, CWEP4303, Compass Building, Al Shohada Road, Al Hamra Industrial Zone-FZ,
                    Ras Al Khaimah, United Arab Emirates. Email:{" "}
                    <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
                </Trans>
            </p>
        </LegalPageLayout>
    );
};

export default RefundPolicy;
