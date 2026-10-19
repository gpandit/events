import {t} from "@lingui/macro";
import {IconBrandInstagram} from "@tabler/icons-react";
import {getConfig} from "../../../../utilites/config.ts";
import classes from './InstagramSection.module.scss';

interface InstagramSectionProps {
    handle: string;
}

export const InstagramSection = ({handle}: InstagramSectionProps) => {
    const embedUrl = getConfig('VITE_INSTAGRAM_EMBED_URL');
    const profileUrl = `https://www.instagram.com/${handle}/`;

    return (
        <div className={classes.section}>
            <div className={classes.header}>
                <IconBrandInstagram size={28} className={classes.headerIcon}/>
                <h1 className={classes.title}>{t`Follow us on Instagram`}</h1>
                <p className={classes.subtitle}>
                    {t`See the latest photos and updates from`}{" "}
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer">@{handle}</a>
                </p>
            </div>

            {embedUrl ? (
                <div className={classes.embedWrapper}>
                    <iframe
                        src={embedUrl}
                        title={t`Instagram feed`}
                        className={classes.embedFrame}
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className={classes.fallback}>
                    <p>{t`Our latest posts are on Instagram — tap below to see them.`}</p>
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={classes.followButton}>
                        <IconBrandInstagram size={20}/>
                        {t`View @${handle} on Instagram`}
                    </a>
                </div>
            )}
        </div>
    );
};

export default InstagramSection;
