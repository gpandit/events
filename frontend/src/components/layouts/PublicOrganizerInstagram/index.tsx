import {useLoaderData} from "react-router";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {InstagramSection} from "../OrganizerHomepage/InstagramSection";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";
import {getOrganizerInstagramHandle} from "../../../utilites/organizerContent.ts";

export const PublicOrganizerInstagram = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData?: GenericPaginatedResponse<Event>;
        isPastEvents: boolean;
    };

    const handle = loaderData?.organizer ? getOrganizerInstagramHandle(loaderData.organizer) : '';

    if (!loaderData?.organizer || !handle) {
        return <OrganizerNotFound/>;
    }

    return (
        <OrganizerPageShell organizer={loaderData.organizer} activeNav="home">
            <InstagramSection handle={handle}/>
        </OrganizerPageShell>
    );
};

export default PublicOrganizerInstagram;
