import React, {useState} from 'react';
import {ActionIcon} from '@mantine/core';
import {t} from "@lingui/macro";
import {IconExternalLink, IconMail, IconMapPin, IconWorld} from '@tabler/icons-react';
import {Organizer} from "../../../../types.ts";
import {socialMediaConfig} from "../../../../constants/socialMediaConfig";
import {ContactOrganizerModal} from "../../../common/ContactOrganizerModal";
import {UserGeneratedContent} from "../../../common/UserGeneratedContent";
import {formatAddress, getShortLocationDisplay} from "../../../../utilites/addressUtilities.ts";
import classes from '../OrganizerHomepage.module.scss';

interface OrganizerProfileCardProps {
    organizer: Organizer;
}

export const OrganizerProfileCard: React.FC<OrganizerProfileCardProps> = ({organizer}) => {
    const [contactModalOpen, setContactModalOpen] = useState(false);

    const socialLinks = organizer.settings?.social_media_handles ? Object.entries(organizer.settings.social_media_handles)
        .filter(([platform, handle]) => handle && socialMediaConfig[platform as keyof typeof socialMediaConfig])
        .map(([platform, handle]) => ({
            platform,
            handle: handle as string,
            config: socialMediaConfig[platform as keyof typeof socialMediaConfig]
        })) : [];

    const websiteUrl = organizer.website;
    const organizerLogo = organizer.images?.find(img => img.type === 'ORGANIZER_LOGO');

    const getGoogleMapsUrl = (locationDetails: any) => {
        if (!locationDetails) return '';
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(locationDetails))}`;
    };

    return (
        <>
            <div className={classes.heroSection}>
                <div className={classes.organizerContentWrapper}>
                    <div className={classes.organizerContent}>
                        <div className={classes.organizerProfile}>
                            <div className={classes.profileMain}>
                                {organizerLogo && (
                                    <div className={classes.logoWrapper}>
                                        <img
                                            src={organizerLogo.url}
                                            alt="Logo"
                                            className={classes.logo}
                                        />
                                    </div>
                                )}
                                <div className={classes.organizerInfo}>
                                    <div className={classes.nameSection}>
                                        <h2>{organizer.name}</h2>
                                        <div className={classes.organizerMeta}>
                                            {getShortLocationDisplay(organizer?.location?.structured_address) && (
                                                <div className={classes.metaItem}>
                                                    <IconMapPin size={15} className={classes.metaIcon}/>
                                                    <a
                                                        href={getGoogleMapsUrl(organizer.location!.structured_address!)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={classes.mapLink}
                                                    >
                                                        <span>{getShortLocationDisplay(organizer.location!.structured_address!)}</span>
                                                        <IconExternalLink size={12}/>
                                                    </a>
                                                </div>
                                            )}
                                            {websiteUrl && (
                                                <div className={classes.metaItem}>
                                                    <IconWorld size={15} className={classes.metaIcon}/>
                                                    <a
                                                        href={websiteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {new URL(websiteUrl).hostname}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={classes.profileActions}>
                                        {(socialLinks.length > 0) && (
                                            <div className={classes.socialLinks}>
                                                {socialLinks.map(({platform, handle, config}) => {
                                                    const IconComponent = config.icon;
                                                    const url = config.baseUrl + handle;
                                                    return (
                                                        <ActionIcon
                                                            key={platform}
                                                            component="a"
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={classes.socialIcon}
                                                            variant="subtle"
                                                            size="md"
                                                        >
                                                            <IconComponent size={16}/>
                                                        </ActionIcon>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setContactModalOpen(true)}
                                            className={classes.contactButton}
                                        >
                                            <IconMail size={14} style={{marginRight: 6}}/>
                                            {t`Contact`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {organizer?.description && (
                            <UserGeneratedContent
                                className={classes.description}
                                html={organizer.description}
                            />
                        )}
                    </div>
                </div>
            </div>

            <ContactOrganizerModal
                opened={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                organizer={organizer}
            />
        </>
    );
};

export default OrganizerProfileCard;
