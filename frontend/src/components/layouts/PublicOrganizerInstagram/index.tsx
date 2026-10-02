import {useLoaderData} from "react-router";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {InstagramSection} from "../OrganizerHomepage/InstagramSection";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";

export const PublicOrganizerInstagram = () => {
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
            <InstagramSection/>
        </OrganizerPageShell>
    );
};

export default PublicOrganizerInstagram;
