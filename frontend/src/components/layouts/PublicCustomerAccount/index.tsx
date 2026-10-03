import {useLoaderData} from "react-router";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {CustomerAccount} from "../OrganizerHomepage/CustomerAccount";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";

export const PublicCustomerAccount = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData?: GenericPaginatedResponse<Event>;
        isPastEvents: boolean;
    };

    if (!loaderData?.organizer) {
        return <OrganizerNotFound/>;
    }

    return (
        <OrganizerPageShell organizer={loaderData.organizer} activeNav="account">
            <CustomerAccount organizer={loaderData.organizer}/>
        </OrganizerPageShell>
    );
};

export default PublicCustomerAccount;
