import React, {useEffect, useState} from 'react';
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

export const OrganizerNav: React.FC<OrganizerNavProps> = ({organizer, active}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const overHero = active === 'home';
    const transparent = overHero && !scrolled && !menuOpen;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 24);
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
        <nav className={`${classes.nav} ${overHero ? classes.navOverlay : ''} ${transparent ? classes.navTransparent : ''}`}>
            <div className={classes.navInner}>
                <Link to={homePath} className={classes.brand} onClick={closeMenu}>
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
                        {t`Parent Account`}
                    </Link>
                    <Link to="/auth/login" className={classes.link}>
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
                        {t`Parent Account`}
                    </Link>
                    <Link to="/auth/login" className={classes.link} onClick={closeMenu}>
                        {t`My Account`}
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default OrganizerNav;
