import {useLoaderData, useParams} from "react-router";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {ResourcesForChildren} from "../OrganizerHomepage/ResourcesForChildren";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";

export const PublicChildrenResources = () => {
    const {tab} = useParams();
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
            <ResourcesForChildren organizer={loaderData.organizer} activeTab={tab}/>
        </OrganizerPageShell>
    );
};

export default PublicChildrenResources;
