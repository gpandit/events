import {LegalPageLayout} from "../../../common/LegalPageLayout";

const UPDATED_DATE = "October 2, 2026";

export const PrivacyPolicy = () => {
    return (
        <LegalPageLayout title="Privacy Policy" updatedDate={UPDATED_DATE}>
            <p>
                This Privacy Policy explains how Aqualeo Digecom FZ LLC ("Aqualeo Digecom", "we", "us", or "our"),
                the operator of the Friends of School platform and this website, collects, uses, and protects your
                personal information when you visit this site, register for an event, or otherwise interact with us.
            </p>

            <h2>1. Who we are</h2>
            <p>
                This website is operated by Aqualeo Digecom FZ LLC. If you have any questions about this policy or
                how your data is handled, you can reach us at{" "}
                <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
            </p>

            <h2>2. Information we collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
                <li>Your name, email address, and contact details when you register for an event or contact us.</li>
                <li>Billing information necessary to process ticket purchases (handled securely by our payment
                    processor — see Section 4).
                </li>
                <li>Any messages or information you submit through our contact forms.</li>
            </ul>
            <p>
                We also automatically collect limited technical information, such as your IP address, browser type,
                and pages visited, to help us operate and improve the site. Where cookies are used for this purpose,
                you can control your preferences at any time via the cookie settings link in the footer.
            </p>

            <h2>3. How we use your information</h2>
            <ul>
                <li>To process event registrations and ticket purchases.</li>
                <li>To communicate with you about events you've registered for.</li>
                <li>To respond to enquiries submitted through our contact form.</li>
                <li>To improve and secure our website and services.</li>
            </ul>

            <h2>4. Payment processing</h2>
            <p>
                Ticket payments on this site are processed securely by Stripe, a PCI-compliant third-party payment
                processor. We do not store your full card details on our servers. Please refer to{" "}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
                    Stripe's Privacy Policy
                </a>{" "}
                for details on how Stripe handles your payment information.
            </p>

            <h2>5. Cookies</h2>
            <p>
                We use essential cookies required for the site to function, and, where you consent, optional
                analytics and advertising cookies to help us understand how the site is used. You can change your
                cookie preferences at any time using the "Cookie settings" link in the website footer.
            </p>

            <h2>6. Sharing your information</h2>
            <p>
                We do not sell your personal information. We share information only with service providers who help
                us operate the site (such as our payment processor and email delivery provider), or where required
                by law.
            </p>

            <h2>7. Data retention</h2>
            <p>
                We retain personal information for as long as necessary to fulfil the purposes described in this
                policy, including to comply with legal, accounting, or reporting obligations.
            </p>

            <h2>8. Your rights</h2>
            <p>
                You may request access to, correction of, or deletion of your personal information by contacting us
                at <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
            </p>

            <h2>9. Contact us</h2>
            <p>
                If you have questions about this Privacy Policy, please contact Aqualeo Digecom FZ LLC at{" "}
                <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
            </p>

            <h2>10. Changes to this policy</h2>
            <p>
                We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page
                reflects the most recent changes.
            </p>
        </LegalPageLayout>
    );
};

export default PrivacyPolicy;
