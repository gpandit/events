import React, {useEffect} from 'react';
import {useLocation} from "react-router";
import {Organizer} from "../../../../types.ts";
import {OrganizerDocumentHead} from "../../../common/OrganizerDocumentHead";
import {StatusToggle} from "../../../common/StatusToggle";
import {ensureHomepageFontLoaded} from "../../../../utilites/fontLoader.ts";
import {useOrganizerTrackingPixels} from "../../../../hooks/useOrganizerTrackingPixels";
import {useOrganizerThemeStyles} from "../../../../hooks/useOrganizerThemeStyles.ts";
import {removeTransparency} from "../../../../utilites/colorHelper.ts";
import {OrganizerNav} from "../OrganizerNav";
import {SiteFooter} from "../SiteFooter";
import {FloatingSiteControls} from "../../../common/FloatingSiteControls";
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

    const {themeSettings, themeStyles} = useOrganizerThemeStyles(organizer);
    const backgroundType = themeSettings.background_type;

    const organizerCover = organizer.images?.find(img => img.type === 'ORGANIZER_COVER');

    useEffect(() => {
        ensureHomepageFontLoaded(themeSettings.font_family);
    }, [themeSettings.font_family]);

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
                    </div>
                </div>

                <SiteFooter organizer={organizer}/>
                <FloatingSiteControls/>
            </main>
        </>
    );
};

export default OrganizerPageShell;
