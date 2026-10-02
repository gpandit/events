import {t, Trans} from "@lingui/macro";
import {LegalPageLayout} from "../../../common/LegalPageLayout";

const UPDATED_DATE = "October 2, 2026";

export const PrivacyPolicy = () => {
    return (
        <LegalPageLayout title={t`Privacy Policy`} updatedDate={UPDATED_DATE}>
            <p>
                <Trans>
                    This Privacy Policy explains how Aqualeo Digecom FZ LLC ("Aqualeo Digecom", "we", "us", or
                    "our"), the operator of the Friends of School platform and this website, collects, uses, and
                    protects your personal information when you visit this site, register for an event, or
                    otherwise interact with us.
                </Trans>
            </p>

            <h2><Trans>1. Who we are</Trans></h2>
            <p>
                <Trans>
                    This website is operated by Aqualeo Digecom FZ LLC. If you have any questions about this policy
                    or how your data is handled, you can reach us at{" "}
                    <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
                </Trans>
            </p>

            <h2><Trans>2. Information we collect</Trans></h2>
            <p><Trans>We collect information you provide directly to us, including:</Trans></p>
            <ul>
                <li>
                    <Trans>Your name, email address, and contact details when you register for an event or
                        contact us.</Trans>
                </li>
                <li>
                    <Trans>Billing information necessary to process ticket purchases (handled securely by our
                        payment processor — see Section 4).</Trans>
                </li>
                <li>
                    <Trans>Any messages or information you submit through our contact forms.</Trans>
                </li>
            </ul>
            <p>
                <Trans>
                    We also automatically collect limited technical information, such as your IP address, browser
                    type, and pages visited, to help us operate and improve the site. Where cookies are used for
                    this purpose, you can control your preferences at any time via the cookie settings link in the
                    footer.
                </Trans>
            </p>

            <h2><Trans>3. How we use your information</Trans></h2>
            <ul>
                <li><Trans>To process event registrations and ticket purchases.</Trans></li>
                <li><Trans>To communicate with you about events you've registered for.</Trans></li>
                <li><Trans>To respond to enquiries submitted through our contact form.</Trans></li>
                <li><Trans>To improve and secure our website and services.</Trans></li>
            </ul>

            <h2><Trans>4. Payment processing</Trans></h2>
            <p>
                <Trans>
                    Ticket payments on this site are processed securely by Stripe, a PCI-compliant third-party
                    payment processor. We do not store your full card details on our servers. Please refer to{" "}
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
                        Stripe's Privacy Policy
                    </a>{" "}
                    for details on how Stripe handles your payment information.
                </Trans>
            </p>

            <h2><Trans>5. Cookies</Trans></h2>
            <p>
                <Trans>
                    We use essential cookies required for the site to function, and, where you consent, optional
                    analytics and advertising cookies to help us understand how the site is used. You can change
                    your cookie preferences at any time using the "Cookie settings" link in the website footer.
                </Trans>
            </p>

            <h2><Trans>6. Sharing your information</Trans></h2>
            <p>
                <Trans>
                    We do not sell your personal information. We share information only with service providers who
                    help us operate the site (such as our payment processor and email delivery provider), or where
                    required by law.
                </Trans>
            </p>

            <h2><Trans>7. Data retention</Trans></h2>
            <p>
                <Trans>
                    We retain personal information for as long as necessary to fulfil the purposes described in
                    this policy, including to comply with legal, accounting, or reporting obligations.
                </Trans>
            </p>

            <h2><Trans>8. Your rights</Trans></h2>
            <p>
                <Trans>
                    You may request access to, correction of, or deletion of your personal information by
                    contacting us at <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
                </Trans>
            </p>

            <h2><Trans>9. Contact us</Trans></h2>
            <p>
                <Trans>
                    If you have questions about this Privacy Policy, please contact Aqualeo Digecom FZ LLC at{" "}
                    <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
                </Trans>
            </p>

            <h2><Trans>10. Changes to this policy</Trans></h2>
            <p>
                <Trans>
                    We may update this Privacy Policy from time to time. The "Last updated" date at the top of this
                    page reflects the most recent changes.
                </Trans>
            </p>
        </LegalPageLayout>
    );
};

export default PrivacyPolicy;
