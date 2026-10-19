import {useLoaderData} from "react-router";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";
import {OrganizerAboutPage} from "./OrganizerAboutPage.tsx";

export const PublicOrganizerAbout = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData?: GenericPaginatedResponse<Event>;
        isPastEvents: boolean;
    };

    if (!loaderData?.organizer) {
        return <OrganizerNotFound/>;
    }

    return <OrganizerAboutPage organizer={loaderData.organizer}/>;
};

export default PublicOrganizerAbout;
