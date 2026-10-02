import React from 'react';
import {Link} from "react-router";
import {t} from "@lingui/macro";
import {Organizer} from "../../../../types.ts";
import {organizerEventsPath, organizerHomepagePath} from "../../../../utilites/urlHelper.ts";
import classes from './OrganizerNav.module.scss';

interface OrganizerNavProps {
    organizer: Organizer;
    active?: 'home' | 'events' | 'about';
}

export const OrganizerNav: React.FC<OrganizerNavProps> = ({organizer, active}) => {
    const organizerLogo = organizer.images?.find(img => img.type === 'ORGANIZER_LOGO');

    return (
        <nav className={classes.nav}>
            <div className={classes.navInner}>
                <Link to={organizerHomepagePath(organizer)} className={classes.brand}>
                    {organizerLogo ? (
                        <img src={organizerLogo.url} alt={organizer.name} className={classes.brandLogo}/>
                    ) : (
                        <span className={classes.brandName}>{organizer.name}</span>
                    )}
                </Link>

                <div className={classes.links}>
                    <Link
                        to={organizerHomepagePath(organizer)}
                        className={`${classes.link} ${active === 'home' ? classes.linkActive : ''}`}
                    >
                        {t`Home`}
                    </Link>
                    <Link
                        to={organizerEventsPath(organizer)}
                        className={`${classes.link} ${active === 'events' ? classes.linkActive : ''}`}
                    >
                        {t`Events`}
                    </Link>
                    <Link
                        to={`${organizerHomepagePath(organizer)}/about`}
                        className={`${classes.link} ${active === 'about' ? classes.linkActive : ''}`}
                    >
                        {t`About Us`}
                    </Link>
                    <Link
                        to={`${organizerHomepagePath(organizer)}#resources-for-children`}
                        className={classes.link}
                    >
                        {t`Children's Resources`}
                    </Link>
                    <Link to="/auth/login" className={classes.link}>
                        {t`My Account`}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default OrganizerNav;
