import React, {useState} from 'react';
import {Link} from "react-router";
import {t} from "@lingui/macro";
import {IconBook2, IconBrandInstagram, IconLoader2, IconMail, IconSend} from "@tabler/icons-react";
import {Organizer} from "../../../../types.ts";
import {organizerEventsPath, organizerHomepagePath, organizerResourcesPath} from "../../../../utilites/urlHelper.ts";
import {getConfig} from "../../../../utilites/config.ts";
import {PoweredByFooter} from "../../../common/PoweredByFooter";
import {PaymentIcons} from "../../../common/PaymentIcons";
import {CookieSettingsLink} from "../../../common/CookieSettingsLink";
import {useSubmitSiteContact} from "../../../../mutations/useSubmitSiteContact.ts";
import {showError, showSuccess} from "../../../../utilites/notifications.tsx";
import classes from './SiteFooter.module.scss';

interface SiteFooterProps {
    organizer: Organizer;
}

const ContactForm: React.FC = () => {
    const contactMutation = useSubmitSiteContact();
    const [values, setValues] = useState({name: '', email: '', message: ''});
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!values.name || !values.email || !values.message) {
            setError(t`Please fill in all fields`);
            return;
        }

        setError(null);
        contactMutation.mutate(values, {
            onSuccess: () => {
                showSuccess(t`Your message has been sent. We'll be in touch soon!`);
                setValues({name: '', email: '', message: ''});
            },
            onError: (err: any) => {
                showError(err?.response?.data?.message || t`Failed to send message. Please try again.`);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className={classes.contactForm}>
            <input
                type="text"
                placeholder={t`Your name`}
                value={values.name}
                onChange={(e) => setValues({...values, name: e.target.value})}
                className={classes.contactInput}
                aria-label={t`Your name`}
            />
            <input
                type="email"
                placeholder={t`Your email`}
                value={values.email}
                onChange={(e) => setValues({...values, email: e.target.value})}
                className={classes.contactInput}
                aria-label={t`Your email`}
            />
            <textarea
                placeholder={t`How can we help?`}
                value={values.message}
                onChange={(e) => setValues({...values, message: e.target.value})}
                className={classes.contactTextarea}
                rows={3}
                aria-label={t`Message`}
            />
            {error && <p className={classes.contactError}>{error}</p>}
            <button type="submit" className={classes.contactSubmit} disabled={contactMutation.isPending}>
                {contactMutation.isPending ? <IconLoader2 size={16} className={classes.spin}/> :
                    <IconSend size={16}/>}
                {t`Send message`}
            </button>
        </form>
    );
};

export const SiteFooter: React.FC<SiteFooterProps> = ({organizer}) => {
    const year = new Date().getFullYear();
    const instagramHandle = getConfig('VITE_INSTAGRAM_HANDLE', 'friendsofreptonab');

    return (
        <footer className={classes.footer}>
            <div className={classes.inner}>
                <div className={classes.columns}>
                    <div className={classes.brandColumn}>
                        <a href="https://friendsofschool.com/" target="_blank" rel="noopener noreferrer">
                            <img
                                src="/logos/friends-of-school-logo-white.webp"
                                alt={t`Friends of School`}
                                className={classes.brandLogo}
                            />
                        </a>
                        <p className={classes.brandText}>
                            {t`Powered by Friends of School, an initiative by`}{" "}
                            <a href="https://aqualeo.co" target="_blank" rel="noopener noreferrer">
                                Aqualeo Digecom
                            </a>
                        </p>
                        <div className={classes.paymentIconsWrapper}>
                            <PaymentIcons/>
                        </div>
                    </div>

                    <div className={classes.linkColumn}>
                        <h3 className={classes.columnTitle}>{t`Quick Links`}</h3>
                        <Link to={organizerHomepagePath(organizer)} className={classes.footerNavLink}>
                            {t`Home`}
                        </Link>
                        <Link to={organizerEventsPath(organizer)} className={classes.footerNavLink}>
                            {t`Events`}
                        </Link>
                        <Link to={`${organizerHomepagePath(organizer)}/about`} className={classes.footerNavLink}>
                            {t`About Us`}
                        </Link>
                        <Link to={`${organizerHomepagePath(organizer)}/instagram`} className={classes.footerNavLink}>
                            <IconBrandInstagram size={14}/> {t`Instagram`}
                        </Link>
                        <Link to={`${organizerHomepagePath(organizer)}/stories`} className={classes.footerNavLink}>
                            <IconBook2 size={14}/> {t`Children's Stories`}
                        </Link>
                        <Link
                            to={organizerResourcesPath(organizer)}
                            className={classes.footerNavLink}
                        >
                            {t`Children's Resources`}
                        </Link>
                        <Link to="/auth/login" className={classes.footerNavLink}>
                            {t`My Account`}
                        </Link>
                    </div>

                    <div className={classes.linkColumn}>
                        <h3 className={classes.columnTitle}>{t`Legal`}</h3>
                        <a href={getConfig('VITE_PRIVACY_URL', '/privacy-policy')} className={classes.footerNavLink}>
                            {t`Privacy Policy`}
                        </a>
                        <a href={getConfig('VITE_TOS_URL', '/terms-of-service')} className={classes.footerNavLink}>
                            {t`Terms of Service`}
                        </a>
                        <a href="/cookie-policy" className={classes.footerNavLink}>
                            {t`Cookie Policy`}
                        </a>
                        <CookieSettingsLink className={classes.footerNavLink}/>
                    </div>

                    <div className={classes.contactColumn}>
                        <h3 className={classes.columnTitle}>
                            <IconMail size={16}/> {t`Contact Us`}
                        </h3>
                        <a href="mailto:friendsofreptonalbarsha@gmail.com" className={classes.footerNavLink}>
                            friendsofreptonalbarsha@gmail.com
                        </a>
                        <ContactForm/>
                    </div>
                </div>

                <div className={classes.bottomBar}>
                    <p className={classes.copyright}>
                        © {year} Aqualeo Digecom FZ LLC. {t`All rights reserved.`}
                    </p>
                    <PoweredByFooter className={classes.poweredBy}/>
                </div>

                <p className={classes.instagramHint}>@{instagramHandle}</p>
            </div>
        </footer>
    );
};

export default SiteFooter;
