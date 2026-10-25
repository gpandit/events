import {useEffect} from "react";
import {t} from "@lingui/macro";
import {Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {OrganizerProfileCard} from "../OrganizerHomepage/OrganizerProfileCard";
import {TeamSection} from "./TeamSection.tsx";
import {VolunteerForm} from "./VolunteerForm";
import {validateThemeSettings} from "../../../utilites/themeUtils.ts";
import {getOrganizerContactEmail} from "../../../utilites/organizerContent.ts";
import classes from './PublicOrganizerAbout.module.scss';

interface OrganizerAboutPageProps {
    organizer: Organizer;
}

export const OrganizerAboutPage = ({organizer}: OrganizerAboutPageProps) => {
    const themeSettings = validateThemeSettings(organizer.settings?.homepage_theme_settings);
    const contactEmail = getOrganizerContactEmail(organizer);
    const teamMembers = themeSettings.team_members ?? [];
    const technicalTeamMembers = themeSettings.technical_team_members ?? [];
    const images = organizer.images ?? [];

    useEffect(() => {
        if (window.location.hash === '#get-in-touch') {
            document.getElementById('get-in-touch')?.scrollIntoView();
        }
    }, []);

    return (
        <OrganizerPageShell organizer={organizer} activeNav="about">
            <OrganizerProfileCard organizer={organizer} showContactButton={false} showDescription={!themeSettings.about_text}>
                {themeSettings.about_text && <p className={classes.blurb}>{themeSettings.about_text}</p>}
                <p className={classes.contactEmail}>
                    {t`Contact us:`} <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </p>
            </OrganizerProfileCard>

            <TeamSection
                heading={themeSettings.team_heading || t`Meet the team`}
                members={teamMembers}
                images={images}
                groupPhoto={images.find((image) => image.type === 'TEAM_GROUP_PHOTO')}
            />

            <TeamSection
                heading={themeSettings.technical_team_heading || t`Technical Team`}
                members={technicalTeamMembers}
                images={images}
            />

            <section id="get-in-touch" className={classes.volunteerSection}>
                <h2 className={classes.heading}>
                    {themeSettings.contact_heading || t`Get involved - volunteer, sponsor or say hello`}
                </h2>
                <p className={classes.volunteerIntro}>
                    {themeSettings.contact_intro || t`Whether you'd like to volunteer, explore sponsorship opportunities or just ask a question, leave your details below and we'll get in touch.`}
                </p>
                <VolunteerForm/>
            </section>
        </OrganizerPageShell>
    );
};
