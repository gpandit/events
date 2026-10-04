import {Navigate, Outlet, useLocation} from "react-router";
import classes from "./Auth.module.scss";
import {t, Trans} from "@lingui/macro";
import {useGetMe} from "../../../queries/useGetMe.ts";
import {useGetOrganizerPublic} from "../../../queries/useGetOrganizerPublic.ts";
import {PoweredByFooter} from "../../common/PoweredByFooter";
import {LanguageSwitcher} from "../../common/LanguageSwitcher";
import {OrganizerNav} from "../OrganizerHomepage/OrganizerNav";
import {SiteFooter} from "../OrganizerHomepage/SiteFooter";
import {ThemeToggle} from "../../common/ThemeToggle";
import {useOrganizerThemeStyles} from "../../../hooks/useOrganizerThemeStyles.ts";
import {useCallback, useEffect, useRef} from "react";
import {getConfig} from "../../../utilites/config.ts";
import {isHiEvents} from "../../../utilites/helpers.ts";
import {showInfo} from "../../../utilites/notifications.tsx";
import {captureUtmData} from "../../../utilites/utm.ts";

const FeaturePanel = () => {
    return (
        <div className={classes.rightPanel}>
            <div className={classes.checker} aria-hidden="true"/>
            <div className={classes.noise}/>

            <div className={classes.panelInner}>
                <a
                    href="https://friendsofschool.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.fosLogoLink}
                >
                    <img
                        src="/logos/friends-of-school-logo-white.webp"
                        alt={t`Friends of School`}
                        className={classes.fosLogo}
                    />
                </a>

                <p className={classes.tagline}>
                    <Trans>
                        Event ticketing @ Repton Al Barsha, supported by <strong>Friends of School</strong> — an
                        initiative by Aqualeo Digecom, powered by Hi.Events.
                    </Trans>
                </p>

                <div className={classes.ticketScene} aria-hidden="true">
                    <div className={classes.ticketGhost}/>
                    <div className={classes.ticket}>
                        <div className={classes.ticketInner}>
                            <div className={classes.ticketMain}>
                                <div className={classes.ticketTop}>
                                    <span>Admit One</span>
                                    <span>№ 000482</span>
                                </div>
                                <div className={classes.ticketTitle}>Repton Movie Night</div>
                                <div className={classes.ticketMeta}>Sat, Aug 16 · 6:00 PM · Repton Al Barsha</div>
                                <div className={classes.ticketFields}>
                                    <div className={classes.ticketField}>
                                        <span>Door</span>
                                        <strong>3</strong>
                                    </div>
                                    <div className={classes.ticketField}>
                                        <span>Seat</span>
                                        <strong>GA</strong>
                                    </div>
                                    <div className={classes.ticketField}>
                                        <span>Price</span>
                                        <strong>AED 30</strong>
                                    </div>
                                </div>
                                <div className={classes.barcode}/>
                            </div>
                            <div className={classes.ticketStub}>
                                <span className={classes.stubLabel}>Admit One</span>
                                <svg className={classes.stubQr} viewBox="0 0 25 25">
                                    <path fillRule="evenodd" d="M0 0h7v7H0zm1 1v5h5V1z"/>
                                    <rect x="2" y="2" width="3" height="3"/>
                                    <path fillRule="evenodd" d="M18 0h7v7h-7zm1 1v5h5V1z"/>
                                    <rect x="20" y="2" width="3" height="3"/>
                                    <path fillRule="evenodd" d="M0 18h7v7H0zm1 1v5h5v-5z"/>
                                    <rect x="2" y="20" width="3" height="3"/>
                                    <rect x="9" y="0" width="2" height="2"/>
                                    <rect x="13" y="2" width="2" height="2"/>
                                    <rect x="10" y="5" width="2" height="2"/>
                                    <rect x="15" y="5" width="2" height="2"/>
                                    <rect x="0" y="9" width="2" height="2"/>
                                    <rect x="4" y="10" width="2" height="2"/>
                                    <rect x="8" y="9" width="3" height="3"/>
                                    <rect x="13" y="10" width="2" height="2"/>
                                    <rect x="17" y="9" width="2" height="2"/>
                                    <rect x="21" y="10" width="2" height="2"/>
                                    <rect x="2" y="14" width="2" height="2"/>
                                    <rect x="7" y="13" width="2" height="2"/>
                                    <rect x="11" y="14" width="2" height="2"/>
                                    <rect x="15" y="13" width="3" height="3"/>
                                    <rect x="20" y="14" width="2" height="2"/>
                                    <rect x="9" y="18" width="2" height="2"/>
                                    <rect x="13" y="19" width="2" height="2"/>
                                    <rect x="18" y="18" width="2" height="2"/>
                                    <rect x="22" y="19" width="2" height="2"/>
                                    <rect x="10" y="22" width="3" height="2"/>
                                    <rect x="16" y="22" width="2" height="2"/>
                                </svg>
                                <span className={classes.stubSeat}>GA — AED 30</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScrollToTop = () => {
    const {pathname} = useLocation();

    useEffect(() => {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    }, [pathname]);

    return null;
}

const AuthLayout = () => {
    const me = useGetMe();
    const defaultOrganizerId = getConfig('VITE_DEFAULT_ORGANIZER_ID');
    const {data: organizer} = useGetOrganizerPublic(defaultOrganizerId, {enabled: !me.isSuccess});
    const {themeStyles, mode} = useOrganizerThemeStyles(organizer);
    const clickCountRef = useRef(0);
    const clickTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        captureUtmData();
    }, []);

    const handleLogoClick = useCallback(() => {
        clickCountRef.current += 1;
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 2000);

        if (clickCountRef.current >= 5) {
            clickCountRef.current = 0;
            showInfo(`HiEvents v${__APP_VERSION__}`);
        }
    }, []);

    if (me.isSuccess) {
        return <Navigate to={'/manage/events'} />
    }

    return (
        <div className={classes.authLayout} style={themeStyles} data-mode={mode}>
            <ScrollToTop/>

            {organizer && <OrganizerNav organizer={organizer}/>}

            <div className={classes.splitLayout}>
                <div className={classes.leftPanel}>
                    <main className={classes.container}>
                        <div className={classes.logo} onClick={handleLogoClick} style={{cursor: 'pointer'}}>
                            <img
                                src={getConfig("VITE_APP_LOGO_DARK", "/logos/friends-of-repton-logo.png")}
                                alt={t`Friends of Repton Al Barsha logo`}
                                className={classes.logoMark}
                            />
                            <span className={classes.logoText}>
                                {getConfig("VITE_APP_NAME", "Friends of Repton Al Barsha")}
                            </span>
                        </div>
                        <div className={classes.formArea}>
                            <div className={classes.wrapper}>
                                <Outlet />
                            </div>
                        </div>
                        <div className={classes.panelFooter}>
                            {/*
                             * (c) Hi.Events Ltd 2024-present
                             *
                             * Hi.Events is licensed under the GNU Affero General Public License (AGPL) version 3.
                             * The full licence text is in the LICENCE file in the repository root.
                             *
                             * Under Section 7(b) of the AGPL, the "Powered by Hi.Events" notice must stay on all web pages
                             * and emails. If you modify Hi.Events you may rephrase it, for example "Powered by [Your Company]
                             * based on Hi.Events", but it must still link to https://hi.events.
                             *
                             * The notice must stay clearly visible and legible. Do not hide or obscure it, for example by
                             * shrinking its font size, lowering its contrast, matching its colour to the background, covering
                             * it or moving it off-screen.
                             *
                             * To remove the notice you need a commercial licence: https://hi.events/licensing
                             * With a licence, hide it through your licence key or configuration rather than by editing this code.
                             *
                             * Commercial licences help keep Hi.Events free and open source. To keep that fair for everyone who
                             * pays, we may work with a third-party compliance partner to find installations that remove or
                             * obscure this notice without a licence. If you hear from us or them, it will start as a friendly
                             * conversation, and you'll have 30 days to get a licence or restore the notice.
                             */}
                            {!isHiEvents() && <PoweredByFooter />}
                            <div className={classes.languageSwitcher}>
                                <LanguageSwitcher />
                            </div>
                        </div>
                    </main>
                </div>

                <FeaturePanel />
            </div>

            {organizer && <SiteFooter organizer={organizer}/>}
            <ThemeToggle/>
        </div>
    );
};

export default AuthLayout;
