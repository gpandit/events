import {t, Trans} from "@lingui/macro";
import {LegalPageLayout} from "../../../common/LegalPageLayout";

const UPDATED_DATE = "October 5, 2026";

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
                <li>
                    <Trans>Information about children who submit stories or poems or use our puzzles, as
                        described in Section 9.</Trans>
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
            <p>
                <Trans>
                    When you delete your data (see Section 8) we remove your name, email address, phone number,
                    address and similar details from your orders, tickets and account, and delete any stories or
                    puzzle accounts created for your children. We keep the financial record of each payment
                    (order reference, amounts, taxes, fees, dates, event and payment processor references) without
                    any personal details, because we are required to retain financial records for accounting,
                    tax and audit purposes. We also keep a minimal log that the deletion took place, which
                    contains only a one-way code derived from your email address and the references of the
                    orders affected, not the email address itself.
                </Trans>
            </p>

            <h2><Trans>8. Your rights</Trans></h2>
            <p>
                <Trans>
                    You may request access to or correction of your personal information by contacting us at{" "}
                    <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>. You can delete your personal information
                    yourself at any time using the "Delete my data" option in My Tickets, which you can reach by
                    signing in to your account or from the link in your ticket emails.
                </Trans>
            </p>

            <h2><Trans>9. Children's privacy</Trans></h2>
            <p>
                <Trans>
                    Some features of this site are used by children: submitting stories and poems, and playing our
                    puzzles. We collect only what we need for these features and we ask for a parent or
                    guardian's permission where it is required.
                </Trans>
            </p>
            <p><Trans><strong>Stories and poems.</strong> When a child submits a story or poem we collect:</Trans></p>
            <ul>
                <li><Trans>their first and last name, class or year group, and the text of their work;</Trans></li>
                <li><Trans>whether they would like it published, and whether they are under 16;</Trans></li>
                <li><Trans>if they would like it published and are under 16, a parent or guardian's email
                    address.</Trans></li>
            </ul>
            <p>
                <Trans>
                    We email the parent or guardian to explain what will be shown and ask for their permission. We
                    record their response and when it was given. Work from a child under 16 is only published if
                    the parent or guardian agrees and our team approves it. If published, the page shows the
                    child's first name, the initial of their last name, their class or year group, the date it
                    was submitted and the work itself. Their full last name is never shown publicly. If the
                    parent or guardian does not respond or declines, the work is not published.
                </Trans>
            </p>
            <p><Trans><strong>Puzzles.</strong> To save scores a child creates a puzzles account, for which we collect:</Trans></p>
            <ul>
                <li><Trans>their first name, email address, password (stored securely) and chosen age group;</Trans></li>
                <li><Trans>if they are 13 or under, a parent or guardian's email address;</Trans></li>
                <li><Trans>their test results and points.</Trans></li>
            </ul>
            <p>
                <Trans>
                    Each child is given an automatically generated character username. Only this username, their
                    points, tests taken and best score appear on the public leaderboard; their real name and
                    email are never shown. For children aged 13 or under we email the parent or guardian to ask
                    permission for the child to appear on the leaderboard. Until permission is given the child can
                    still play and save scores but is not shown on the leaderboard. A child's email address is
                    used only to save their account and to send a password reset link, and a parent or guardian's
                    email address is used only to request and record their permission.
                </Trans>
            </p>
            <p>
                <Trans>
                    Parent and guardian links expire after 14 days. A parent or guardian can ask us at{" "}
                    <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a> to see, correct or delete their child's
                    information, to remove a published story or poem, or to remove their child from the
                    leaderboard, and we will act on the request promptly. We do not use children's information
                    for advertising.
                </Trans>
            </p>

            <h2><Trans>10. Contact us</Trans></h2>
            <p>
                <Trans>
                    If you have questions about this Privacy Policy, please contact Aqualeo Digecom FZ LLC at{" "}
                    <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
                </Trans>
            </p>

            <h2><Trans>11. Changes to this policy</Trans></h2>
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
