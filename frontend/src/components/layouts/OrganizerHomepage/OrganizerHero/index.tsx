import React, {useRef} from 'react';
import {Link} from "react-router";
import {t} from "@lingui/macro";
import {IconArrowRight, IconChevronDown} from '@tabler/icons-react';
import {HomepageThemeSettings, Organizer} from "../../../../types.ts";
import {UserGeneratedContent} from "../../../common/UserGeneratedContent";
import classes from './OrganizerHero.module.scss';

interface OrganizerHeroProps {
    organizer: Organizer;
    themeSettings: HomepageThemeSettings;
    ctaHref: string;
}

export const OrganizerHero: React.FC<OrganizerHeroProps> = ({organizer, themeSettings, ctaHref}) => {
    const heroRef = useRef<HTMLDivElement>(null);

    const scrollDown = () => {
        const hero = heroRef.current;
        if (hero) {
            window.scrollTo({top: hero.offsetTop + hero.offsetHeight, behavior: 'smooth'});
        }
    };

    const organizerCover = organizer.images?.find(img => img.type === 'ORGANIZER_COVER');

    const isVideo = themeSettings.hero_media_type === 'VIDEO' && !!themeSettings.hero_video_url;

    const heading = themeSettings.hero_heading || organizer.name;
    const customSubheading = themeSettings.hero_subheading;
    const fallbackSubheading = t`Discover our upcoming events and get your tickets today`;

    const ctaIsExternal = !!themeSettings.hero_cta_url && /^https?:\/\//i.test(themeSettings.hero_cta_url);
    const ctaText = themeSettings.hero_cta_text || t`View Events`;
    const ctaUrl = themeSettings.hero_cta_url || ctaHref;

    return (
        <div className={classes.hero} ref={heroRef}>
            <div className={classes.media}>
                {isVideo ? (
                    <video
                        className={classes.mediaEl}
                        src={themeSettings.hero_video_url}
                        poster={organizerCover?.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : organizerCover ? (
                    <img
                        className={classes.mediaEl}
                        src={organizerCover.url}
                        alt=""
                        aria-hidden="true"
                    />
                ) : (
                    <div className={classes.mediaFallback}/>
                )}
                <div className={classes.overlay}/>
            </div>

            <div className={classes.content}>
                <h1 className={classes.heading}>{heading}</h1>
                {customSubheading ? (
                    <p className={classes.subheading}>{customSubheading}</p>
                ) : organizer.description ? (
                    <UserGeneratedContent className={classes.subheading} html={organizer.description}/>
                ) : (
                    <p className={classes.subheading}>{fallbackSubheading}</p>
                )}

                {ctaIsExternal ? (
                    <a href={ctaUrl} className={classes.cta}>
                        {ctaText}
                        <IconArrowRight size={18}/>
                    </a>
                ) : (
                    <Link to={ctaUrl} className={classes.cta}>
                        {ctaText}
                        <IconArrowRight size={18}/>
                    </Link>
                )}
            </div>

            <button type="button" className={classes.scrollCue} onClick={scrollDown} data-testid="hero-scroll-down">
                <span>{t`Scroll down`}</span>
                <IconChevronDown size={28} className={classes.scrollCueArrow}/>
            </button>
        </div>
    );
};

export default OrganizerHero;
