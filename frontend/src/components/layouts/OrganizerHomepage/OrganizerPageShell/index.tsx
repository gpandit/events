import React, {useEffect} from 'react';
import {useLocation} from "react-router";
import {Anchor} from '@mantine/core';
import {t} from "@lingui/macro";
import {Organizer} from "../../../../types.ts";
import {OrganizerDocumentHead} from "../../../common/OrganizerDocumentHead";
import {PoweredByFooter} from "../../../common/PoweredByFooter";
import {StatusToggle} from "../../../common/StatusToggle";
import {getConfig} from "../../../../utilites/config.ts";
import {computeThemeVariables, validateThemeSettings} from "../../../../utilites/themeUtils.ts";
import {ensureHomepageFontLoaded} from "../../../../utilites/fontLoader.ts";
import {useOrganizerTrackingPixels} from "../../../../hooks/useOrganizerTrackingPixels";
import {CookieSettingsLink} from "../../../common/CookieSettingsLink";
import {removeTransparency} from "../../../../utilites/colorHelper.ts";
import {OrganizerNav} from "../OrganizerNav";
import classes from '../OrganizerHomepage.module.scss';

interface OrganizerPageShellProps {
    organizer: Organizer;
    activeNav: 'home' | 'events';
    hero?: React.ReactNode;
    children: React.ReactNode;
}

const ScrollToTop = () => {
    const {pathname} = useLocation();

    useEffect(() => {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    }, [pathname]);

    return null;
}

export const OrganizerPageShell: React.FC<OrganizerPageShellProps> = ({organizer, activeNav, hero, children}) => {
    useOrganizerTrackingPixels(organizer?.settings?.tracking_pixels);

    const rawThemeSettings = organizer?.settings?.homepage_theme_settings;
    const themeSettings = validateThemeSettings(rawThemeSettings);
    const cssVars = computeThemeVariables(themeSettings);
    const backgroundType = themeSettings.background_type;

    const organizerCover = organizer.images?.find(img => img.type === 'ORGANIZER_COVER');

    useEffect(() => {
        ensureHomepageFontLoaded(themeSettings.font_family);
    }, [themeSettings.font_family]);

    const themeStyles = {
        '--organizer-bg-color': themeSettings.background,
        '--organizer-content-bg-color': cssVars['--theme-surface'],
        '--organizer-primary-color': themeSettings.accent,
        '--organizer-primary-text-color': cssVars['--theme-text-primary'],
        '--organizer-secondary-color': cssVars['--theme-text-secondary'],
        '--organizer-secondary-text-color': cssVars['--theme-text-tertiary'],
        '--organizer-accent-contrast': cssVars['--theme-accent-contrast'],
        '--organizer-accent-soft': cssVars['--theme-accent-soft'],
        '--organizer-accent-muted': cssVars['--theme-accent-muted'],
        '--organizer-border-color': cssVars['--theme-border'],
        '--theme-font-family': cssVars['--theme-font-family'],
        fontFamily: cssVars['--theme-font-family'],
    } as React.CSSProperties;

    return (
        <>
            <ScrollToTop/>
            {organizer?.status && organizer?.id && (
                <StatusToggle
                    entityType="organizer"
                    entityId={organizer.id}
                    currentStatus={organizer.status as 'DRAFT' | 'LIVE'}
                    entityName={organizer.name}
                    onSuccess={() =>
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000)}
                />
            )}

            <OrganizerDocumentHead organizer={organizer}/>

            <main className={classes.pageWrapper} style={themeStyles} data-mode={themeSettings.mode}>
                <style>
                    {`
                        body, .ssr-loader {
                            background-color: ${removeTransparency(themeSettings.background)} !important;
                        }
                    `}
                </style>

                {(organizerCover && backgroundType === 'MIRROR_COVER_IMAGE') ? (
                    <div
                        className={classes.background}
                        style={{backgroundImage: `url(${organizerCover.url})`}}
                    />
                ) : (
                    <div
                        className={classes.background}
                        style={{backgroundColor: 'var(--organizer-bg-color)'}}
                    />
                )}
                <div
                    className={classes.backgroundOverlay}
                    style={backgroundType === 'MIRROR_COVER_IMAGE' ? {
                        '--overlay-color': themeSettings.background
                    } as React.CSSProperties : undefined}
                />

                <OrganizerNav organizer={organizer} active={activeNav}/>

                {hero}

                <div className={classes.container}>
                    <div className={classes.wrapper}>
                        {children}

                        <div className={classes.footerSection}>
                            <div className={classes.footerLinks}>
                                <Anchor
                                    href={getConfig('VITE_PRIVACY_URL', 'https://hi.events/privacy-policy?utm_source=app-organizer-footer')}
                                    className={classes.footerLink}
                                >
                                    {t`Privacy Policy`}
                                </Anchor>
                                <span className={classes.footerSeparator}>•</span>
                                <Anchor
                                    href={getConfig('VITE_TOS_URL', 'https://hi.events/terms-of-service?utm_source=app-organizer-footer')}
                                    className={classes.footerLink}
                                >
                                    {t`Terms of Service`}
                                </Anchor>
                            </div>
                            <PoweredByFooter className={classes.poweredByFooter}/>
                            <CookieSettingsLink/>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default OrganizerPageShell;
