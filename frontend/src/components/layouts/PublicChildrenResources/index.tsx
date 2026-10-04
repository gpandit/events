import {Navigate, useLoaderData, useParams} from "react-router";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {organizerPuzzlesPath} from "../../../utilites/urlHelper.ts";
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

    if (tab === 'puzzles') {
        return <Navigate to={organizerPuzzlesPath(loaderData.organizer)} replace/>;
    }

    return (
        <OrganizerPageShell organizer={loaderData.organizer} activeNav="resources">
            <ResourcesForChildren/>
        </OrganizerPageShell>
    );
};

export default PublicChildrenResources;
