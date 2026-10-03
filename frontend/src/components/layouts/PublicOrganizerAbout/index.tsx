import {useEffect} from "react";
import {useLoaderData} from "react-router";
import {t, Trans} from "@lingui/macro";
import {IconUser} from "@tabler/icons-react";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {OrganizerProfileCard} from "../OrganizerHomepage/OrganizerProfileCard";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";
import {VolunteerForm} from "./VolunteerForm";
import classes from './PublicOrganizerAbout.module.scss';

const CONTACT_EMAIL = 'friendsofreptonalbarsha@gmail.com';
const TEAM_MEMBERS = ['Toria Ni', 'Emi Burrows', null, null, null, null];

export const PublicOrganizerAbout = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData?: GenericPaginatedResponse<Event>;
        isPastEvents: boolean;
    };

    useEffect(() => {
        if (window.location.hash === '#get-in-touch') {
            document.getElementById('get-in-touch')?.scrollIntoView();
        }
    }, []);

    if (!loaderData?.organizer) {
        return <OrganizerNotFound/>;
    }

    return (
        <OrganizerPageShell organizer={loaderData.organizer} activeNav="about">
            <OrganizerProfileCard organizer={loaderData.organizer} showContactButton={false} showDescription={false}>
                <p className={classes.blurb}>
                    <Trans>
                        Friends of Repton has been supporting the school in managing various events onsite,
                        including movie nights, socials, picnics, year-end balls, and Christmas and year-end
                        events. It also takes an active part in making sure preloved uniforms find a good home.
                    </Trans>
                </p>
                <p className={classes.contactEmail}>
                    <Trans>Contact us: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></Trans>
                </p>
            </OrganizerProfileCard>

            <section className={classes.teamSection}>
                <h2 className={classes.heading}>{t`Meet the Friends of Repton team`}</h2>
                <div className={classes.teamGrid}>
                    {TEAM_MEMBERS.map((memberName, position) => (
                        <div key={position} className={classes.member}>
                            <div className={classes.photo}>
                                <IconUser size={48}/>
                            </div>
                            <span className={classes.memberName}>{memberName ?? t`Name`}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section id="get-in-touch" className={classes.volunteerSection}>
                <h2 className={classes.heading}>{t`Get involved - volunteer, sponsor or say hello`}</h2>
                <p className={classes.volunteerIntro}>
                    {t`Whether you'd like to volunteer, explore sponsorship opportunities or just ask a question, leave your details below and we'll get in touch.`}
                </p>
                <VolunteerForm/>
            </section>
        </OrganizerPageShell>
    );
};

export default PublicOrganizerAbout;
