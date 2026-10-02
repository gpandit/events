import {LegalPageLayout} from "../../../common/LegalPageLayout";

const UPDATED_DATE = "October 2, 2026";

export const TermsOfService = () => {
    return (
        <LegalPageLayout title="Terms of Service" updatedDate={UPDATED_DATE}>
            <p>
                These Terms of Service ("Terms") govern your use of this website and the Friends of School platform,
                operated by Aqualeo Digecom FZ LLC ("Aqualeo Digecom", "we", "us", or "our"). By accessing this site
                or purchasing a ticket, you agree to these Terms.
            </p>

            <h2>1. Who we are</h2>
            <p>
                This website is operated by Aqualeo Digecom FZ LLC. For any questions about these Terms, contact us
                at <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
            </p>

            <h2>2. Event registrations and tickets</h2>
            <p>
                Events listed on this site are organized by Friends of School and affiliated community
                organizers. Ticket availability, pricing, and event details are set by the organizer and may change
                without notice. Please review each event's details carefully before registering.
            </p>

            <h2>3. Payments</h2>
            <p>
                Payments are processed securely through Stripe. By completing a purchase, you authorize us (via our
                payment processor) to charge the payment method you provide for the applicable ticket price and any
                associated fees.
            </p>

            <h2>4. Refunds and cancellations</h2>
            <p>
                Refund and cancellation terms are set by the individual event organizer and will be stated on the
                event page where applicable. If an event is cancelled by the organizer, we will make reasonable
                efforts to notify registered attendees.
            </p>

            <h2>5. Acceptable use</h2>
            <p>
                You agree not to misuse this website, including attempting to interfere with its normal operation,
                submitting false information when registering for an event, or using the contact form to send
                spam or unlawful content.
            </p>

            <h2>6. Intellectual property</h2>
            <p>
                The Friends of School name, logo, and site content are the property of Aqualeo Digecom FZ LLC and
                may not be used without permission. Event content (such as descriptions and images) remains the
                property of the respective organizer.
            </p>

            <h2>7. Limitation of liability</h2>
            <p>
                This site is provided on an "as is" basis. To the fullest extent permitted by law, Aqualeo Digecom
                FZ LLC is not liable for any indirect, incidental, or consequential damages arising from your use of
                this site or attendance at any listed event.
            </p>

            <h2>8. Changes to these Terms</h2>
            <p>
                We may update these Terms from time to time. Continued use of the site after changes are posted
                constitutes acceptance of the updated Terms.
            </p>

            <h2>9. Contact us</h2>
            <p>
                Questions about these Terms can be sent to{" "}
                <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
            </p>
        </LegalPageLayout>
    );
};

export default TermsOfService;
