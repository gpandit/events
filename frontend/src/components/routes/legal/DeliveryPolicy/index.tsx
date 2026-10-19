import {t, Trans} from "@lingui/macro";
import {LegalPageLayout} from "../../../common/LegalPageLayout";

const UPDATED_DATE = "October 19, 2026";

export const DeliveryPolicy = () => {
    return (
        <LegalPageLayout title={t`Delivery Policy`} updatedDate={UPDATED_DATE}>
            <p>
                <Trans>
                    This Delivery Policy applies to tickets and registrations purchased through this website, which
                    is operated by Aqualeo Digecom FZ-LLC ("Aqualeo Digecom", "we", "us", or "our").
                </Trans>
            </p>

            <h2><Trans>1. Delivery method</Trans></h2>
            <p>
                <Trans>
                    All tickets are digital and we do not ship any physical goods. After your payment is confirmed,
                    your tickets and order confirmation are emailed to the address you entered at checkout. Each
                    ticket carries a unique QR code that you can show on your phone or print. You can also open your
                    tickets at any time from the link in your confirmation email or from My Tickets.
                </Trans>
            </p>

            <h2><Trans>2. Delivery timeframe</Trans></h2>
            <p>
                <Trans>
                    Tickets are normally delivered instantly, and in any case within 15 minutes of a successful
                    payment. Some events issue tickets only after the organizer approves your registration. Where
                    this applies it is stated on the event page, and your ticket is sent as soon as it is approved.
                </Trans>
            </p>

            <h2><Trans>3. Delivery and shipping costs</Trans></h2>
            <p>
                <Trans>
                    Because delivery is electronic, there are no shipping or delivery charges. The total shown at
                    checkout includes any applicable taxes and booking fees.
                </Trans>
            </p>

            <h2><Trans>4. If you have not received your tickets</Trans></h2>
            <p>
                <Trans>
                    Please check your spam or junk folder and confirm that you entered your email address correctly.
                    If your tickets have not arrived within one hour of payment, contact us at{" "}
                    <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a> with your order reference and we will
                    re-send them or correct the email address on your order. A missed delivery caused by an
                    incorrectly entered email address is not grounds for a refund.
                </Trans>
            </p>

            <h2><Trans>5. Event access</Trans></h2>
            <p>
                <Trans>
                    Entry requires a valid ticket. Each QR code can be used once, so please do not share it
                    publicly.
                </Trans>
            </p>

            <h2><Trans>6. Contact us</Trans></h2>
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

export default DeliveryPolicy;
