import {useLoaderData} from "react-router";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {ChildrenStoriesSection} from "../OrganizerHomepage/ChildrenStoriesSection";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";

export const PublicChildrenStories = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData?: GenericPaginatedResponse<Event>;
        isPastEvents: boolean;
    };

    if (!loaderData?.organizer) {
        return <OrganizerNotFound/>;
    }

    return (
        <OrganizerPageShell organizer={loaderData.organizer} activeNav="home">
            <ChildrenStoriesSection organizer={loaderData.organizer}/>
        </OrganizerPageShell>
    );
};

export default PublicChildrenStories;
