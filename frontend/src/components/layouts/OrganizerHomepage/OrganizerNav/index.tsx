import React, {useEffect, useRef, useState} from 'react';
import {Link} from "react-router";
import {Burger, Menu} from "@mantine/core";
import {t} from "@lingui/macro";
import {IconChevronDown} from "@tabler/icons-react";
import {Organizer} from "../../../../types.ts";
import {Wordmark} from "../../../common/Wordmark";
import {
    organizerAccountPath,
    organizerEventsPath,
    organizerHomepagePath,
    organizerResourcesPath,
} from "../../../../utilites/urlHelper.ts";
import classes from './OrganizerNav.module.scss';

interface OrganizerNavProps {
    organizer: Organizer;
    active?: 'home' | 'events' | 'about' | 'stories' | 'resources' | 'account';
}

const HIDE_AFTER_PX = 80;
const SCROLL_TOLERANCE_PX = 6;

export const OrganizerNav: React.FC<OrganizerNavProps> = ({organizer, active}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const lastScrollY = useRef(0);
    const overHero = active === 'home';
    const transparent = overHero && !scrolled && !menuOpen;

    useEffect(() => {
        lastScrollY.current = window.scrollY;
        const handleScroll = () => {
            const currentY = window.scrollY;
            const delta = currentY - lastScrollY.current;

            setScrolled(currentY > 24);

            if (currentY <= HIDE_AFTER_PX || delta < -SCROLL_TOLERANCE_PX) {
                setHidden(false);
            } else if (delta > SCROLL_TOLERANCE_PX) {
                setHidden(true);
            }

            if (Math.abs(delta) > SCROLL_TOLERANCE_PX) {
                lastScrollY.current = currentY;
            }
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, {passive: true});
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const organizerLogo = organizer.images?.find(img => img.type === 'ORGANIZER_LOGO');
    const homePath = organizerHomepagePath(organizer);

    const resourceLinks = [
        {to: organizerResourcesPath(organizer, 'colouring-pages'), label: t`Colouring Pages`},
        {to: organizerResourcesPath(organizer, 'puzzles'), label: t`Puzzles`},
        {to: `${homePath}/stories`, label: t`Prose & Poetry`, isStories: true},
    ];

    const linkClass = (isActive: boolean) => `${classes.link} ${isActive ? classes.linkActive : ''}`;
    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className={`${classes.nav} ${overHero ? classes.navOverlay : ''} ${transparent ? classes.navTransparent : ''} ${hidden && !menuOpen ? classes.navHidden : ''}`}>
            <div className={`${classes.navInner} ${organizerLogo ? classes.navInnerWithLogo : ''}`}>
                <Link to={homePath} className={`${classes.brand} ${organizerLogo ? classes.brandWithLogo : ''}`} onClick={closeMenu}>
                    {organizerLogo ? (
                        <img src={organizerLogo.url} alt={organizer.name} className={classes.brandLogo}/>
                    ) : (
                        <span className={classes.brandName}>{organizer.name}</span>
                    )}
                    {organizerLogo && <Wordmark name={organizer.name} className={classes.brandWordmark}/>}
                </Link>

                <div className={classes.desktopLinks}>
                    <Link to={homePath} className={linkClass(active === 'home')}>
                        {t`Home`}
                    </Link>
                    <Link to={organizerEventsPath(organizer)} className={linkClass(active === 'events')}>
                        {t`Events`}
                    </Link>
                    <Menu trigger="hover" openDelay={50} closeDelay={150} position="bottom-start" withinPortal>
                        <Menu.Target>
                            <Link
                                to={organizerResourcesPath(organizer)}
                                className={linkClass(active === 'resources' || active === 'stories')}
                            >
                                {t`Creative Corner`}
                                <IconChevronDown size={14} className={classes.chevron}/>
                            </Link>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {resourceLinks.map(item => (
                                <Menu.Item key={item.to} component={Link} to={item.to}>
                                    {item.label}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                    <Link to={`${homePath}/about`} className={linkClass(active === 'about')}>
                        {t`About Us`}
                    </Link>
                    <Link to={organizerAccountPath(organizer)} className={linkClass(active === 'account')}>
                        {t`My Account`}
                    </Link>
                </div>

                <Burger
                    opened={menuOpen}
                    onClick={() => setMenuOpen(open => !open)}
                    className={classes.burger}
                    size="sm"
                    color={transparent ? '#ffffff' : undefined}
                    aria-label={menuOpen ? t`Close menu` : t`Open menu`}
                    data-testid="organizer-nav-burger"
                />
            </div>

            {menuOpen && (
                <div className={classes.mobileMenu}>
                    <Link to={homePath} className={linkClass(active === 'home')} onClick={closeMenu}>
                        {t`Home`}
                    </Link>
                    <Link
                        to={organizerEventsPath(organizer)}
                        className={linkClass(active === 'events')}
                        onClick={closeMenu}
                    >
                        {t`Events`}
                    </Link>
                    <Link
                        to={organizerResourcesPath(organizer)}
                        className={linkClass(active === 'resources')}
                        onClick={closeMenu}
                    >
                        {t`Creative Corner`}
                    </Link>
                    <div className={classes.subMenu}>
                        {resourceLinks.map(item => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={linkClass(!!item.isStories && active === 'stories')}
                                onClick={closeMenu}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <Link to={`${homePath}/about`} className={linkClass(active === 'about')} onClick={closeMenu}>
                        {t`About Us`}
                    </Link>
                    <Link
                        to={organizerAccountPath(organizer)}
                        className={linkClass(active === 'account')}
                        onClick={closeMenu}
                    >
                        {t`My Account`}
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default OrganizerNav;
