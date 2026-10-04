import {useLoaderData} from "react-router";
import {t} from "@lingui/macro";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {PuzzlesTab} from "../OrganizerHomepage/ResourcesForChildren/PuzzlesTab";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";
import classes from "../OrganizerHomepage/ResourcesForChildren/ResourcesForChildren.module.scss";

export const PublicPuzzles = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData?: GenericPaginatedResponse<Event>;
        isPastEvents: boolean;
    };

    if (!loaderData?.organizer) {
        return <OrganizerNotFound/>;
    }

    return (
        <OrganizerPageShell organizer={loaderData.organizer} activeNav="resources">
            <section className={classes.section}>
                <h2 className={classes.heading}>{t`Puzzles`}</h2>
                <p className={classes.subheading}>{t`Test your general knowledge and climb the leaderboard.`}</p>
                <PuzzlesTab organizer={loaderData.organizer}/>
            </section>
        </OrganizerPageShell>
    );
};

export default PublicPuzzles;
