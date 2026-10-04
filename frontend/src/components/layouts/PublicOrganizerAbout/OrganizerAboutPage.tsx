import {useEffect} from "react";
import {t} from "@lingui/macro";
import {IconUser} from "@tabler/icons-react";
import {Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {OrganizerProfileCard} from "../OrganizerHomepage/OrganizerProfileCard";
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

            {teamMembers.length > 0 && (
                <section className={classes.teamSection}>
                    <h2 className={classes.heading}>{themeSettings.team_heading || t`Meet the team`}</h2>
                    <div className={classes.teamGrid}>
                        {teamMembers.map((memberName, position) => (
                            <div key={position} className={classes.member}>
                                <div className={classes.photo}>
                                    <IconUser size={48}/>
                                </div>
                                <span className={classes.memberName}>{memberName}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

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
