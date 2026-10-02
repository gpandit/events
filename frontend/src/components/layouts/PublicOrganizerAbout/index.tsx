import {useLoaderData} from "react-router";
import {t, Trans} from "@lingui/macro";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {OrganizerProfileCard} from "../OrganizerHomepage/OrganizerProfileCard";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";
import classes from './PublicOrganizerAbout.module.scss';

export const PublicOrganizerAbout = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData?: GenericPaginatedResponse<Event>;
        isPastEvents: boolean;
    };

    if (!loaderData?.organizer) {
        return <OrganizerNotFound/>;
    }

    return (
        <OrganizerPageShell organizer={loaderData.organizer} activeNav="about">
            <section className={classes.section}>
                <h1 className={classes.heading}>{t`About Friends of Repton`}</h1>
                <p className={classes.blurb}>
                    <Trans>
                        Friends of Repton has been supporting the school in managing various events onsite,
                        including movie nights, socials, picnics, year-end balls, and Christmas and year-end
                        events. It also takes an active part in making sure preloved uniforms find a good home.
                    </Trans>
                </p>
            </section>

            <OrganizerProfileCard organizer={loaderData.organizer}/>
        </OrganizerPageShell>
    );
};

export default PublicOrganizerAbout;
