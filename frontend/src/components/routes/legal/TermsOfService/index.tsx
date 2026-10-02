import {t, Trans} from "@lingui/macro";
import {LegalPageLayout} from "../../../common/LegalPageLayout";

const UPDATED_DATE = "October 2, 2026";

export const TermsOfService = () => {
    return (
        <LegalPageLayout title={t`Terms of Service`} updatedDate={UPDATED_DATE}>
            <p>
                <Trans>
                    These Terms of Service ("Terms") govern your use of this website and the Friends of School
                    platform, operated by Aqualeo Digecom FZ LLC ("Aqualeo Digecom", "we", "us", or "our"). By
                    accessing this site or purchasing a ticket, you agree to these Terms.
                </Trans>
            </p>

            <h2><Trans>1. Who we are</Trans></h2>
            <p>
                <Trans>
                    This website is operated by Aqualeo Digecom FZ LLC. For any questions about these Terms,
                    contact us at <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
                </Trans>
            </p>

            <h2><Trans>2. Event registrations and tickets</Trans></h2>
            <p>
                <Trans>
                    Events listed on this site are organized by Friends of School and affiliated community
                    organizers. Ticket availability, pricing, and event details are set by the organizer and may
                    change without notice. Please review each event's details carefully before registering.
                </Trans>
            </p>

            <h2><Trans>3. Payments</Trans></h2>
            <p>
                <Trans>
                    Payments are processed securely through Stripe. By completing a purchase, you authorize us
                    (via our payment processor) to charge the payment method you provide for the applicable ticket
                    price and any associated fees.
                </Trans>
            </p>

            <h2><Trans>4. Refunds and cancellations</Trans></h2>
            <p>
                <Trans>
                    Refund and cancellation terms are set by the individual event organizer and will be stated on
                    the event page where applicable. If an event is cancelled by the organizer, we will make
                    reasonable efforts to notify registered attendees.
                </Trans>
            </p>

            <h2><Trans>5. Acceptable use</Trans></h2>
            <p>
                <Trans>
                    You agree not to misuse this website, including attempting to interfere with its normal
                    operation, submitting false information when registering for an event, or using the contact
                    form to send spam or unlawful content.
                </Trans>
            </p>

            <h2><Trans>6. Intellectual property</Trans></h2>
            <p>
                <Trans>
                    The Friends of School name, logo, and site content are the property of Aqualeo Digecom FZ LLC
                    and may not be used without permission. Event content (such as descriptions and images) remains
                    the property of the respective organizer.
                </Trans>
            </p>

            <h2><Trans>7. Limitation of liability</Trans></h2>
            <p>
                <Trans>
                    This site is provided on an "as is" basis. To the fullest extent permitted by law, Aqualeo
                    Digecom FZ LLC is not liable for any indirect, incidental, or consequential damages arising
                    from your use of this site or attendance at any listed event.
                </Trans>
            </p>

            <h2><Trans>8. Changes to these Terms</Trans></h2>
            <p>
                <Trans>
                    We may update these Terms from time to time. Continued use of the site after changes are
                    posted constitutes acceptance of the updated Terms.
                </Trans>
            </p>

            <h2><Trans>9. Contact us</Trans></h2>
            <p>
                <Trans>
                    Questions about these Terms can be sent to <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
                </Trans>
            </p>
        </LegalPageLayout>
    );
};

export default TermsOfService;
