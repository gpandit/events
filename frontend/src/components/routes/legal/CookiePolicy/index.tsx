import {t, Trans} from "@lingui/macro";
import {LegalPageLayout} from "../../../common/LegalPageLayout";

const UPDATED_DATE = "October 3, 2026";

export const CookiePolicy = () => {
    return (
        <LegalPageLayout title={t`Cookie Policy`} updatedDate={UPDATED_DATE}>
            <p>
                <Trans>
                    This Cookie Policy explains how Aqualeo Digecom FZ LLC ("Aqualeo Digecom", "we", "us", or "our"),
                    the operator of the Friends of School platform and this website, uses cookies and similar
                    technologies, and the choices you have about them.
                </Trans>
            </p>

            <h2><Trans>1. What cookies are</Trans></h2>
            <p>
                <Trans>
                    Cookies are small text files stored on your device when you visit a website. They help the site
                    remember your preferences, keep you signed in, and let us understand how the site is used.
                </Trans>
            </p>

            <h2><Trans>2. The categories we use</Trans></h2>
            <p><Trans>You can control the optional categories at any time using the cookie settings link in the website footer.</Trans></p>
            <ul>
                <li>
                    <Trans>
                        <strong>Essential</strong> — required for the site to work, such as keeping you signed in
                        and remembering your cookie preferences. These cannot be switched off.
                    </Trans>
                </li>
                <li>
                    <Trans>
                        <strong>Analytics</strong> — helps us understand how the site is used, such as which pages
                        are visited, so we can improve it. We use Google Analytics (a service of Google LLC) for this.
                        Only set with your consent.
                    </Trans>
                </li>
                <li>
                    <Trans>
                        <strong>Advertising</strong> — used to measure and personalise ads. Only set with your
                        consent.
                    </Trans>
                </li>
            </ul>

            <h2><Trans>3. Google Analytics</Trans></h2>
            <p>
                <Trans>
                    We use Google Analytics, provided by Google LLC, to measure traffic and usage of this site. With
                    your consent, Google sets cookies (such as _ga) on your device and collects information such as
                    the pages you visit, your approximate location, and your device and browser type. Until you
                    consent to analytics, Google tags run in a restricted mode that does not store analytics cookies,
                    and if you decline they remain restricted. You can learn how Google uses data at{" "}
                    <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
                        policies.google.com/technologies/partner-sites
                    </a>{" "}
                    and opt out through the{" "}
                    <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                        Google Analytics opt-out browser add-on
                    </a>.
                </Trans>
            </p>

            <h2><Trans>4. Managing your preferences</Trans></h2>
            <p>
                <Trans>
                    When you first visit this site, you'll be asked to accept or reject optional cookies. You can
                    change your choice at any time using the "Cookie settings" link in the footer of any page.
                    Revoking a category reloads the page so the change takes effect immediately.
                </Trans>
            </p>

            <h2><Trans>5. Browser controls</Trans></h2>
            <p>
                <Trans>
                    Most browsers also let you block or delete cookies through their own settings. Blocking essential
                    cookies may prevent parts of the site, such as signing in, from working correctly.
                </Trans>
            </p>

            <h2><Trans>6. More information</Trans></h2>
            <p>
                <Trans>
                    For details on how we handle personal information more generally, see our{" "}
                    <a href="/privacy-policy">Privacy Policy</a>. If you have questions about this Cookie Policy,
                    contact us at <a href="mailto:fos@aqualeo.co">fos@aqualeo.co</a>.
                </Trans>
            </p>

            <h2><Trans>7. Changes to this policy</Trans></h2>
            <p>
                <Trans>
                    We may update this Cookie Policy from time to time. The "Last updated" date at the top of this
                    page reflects the most recent changes.
                </Trans>
            </p>
        </LegalPageLayout>
    );
};

export default CookiePolicy;
