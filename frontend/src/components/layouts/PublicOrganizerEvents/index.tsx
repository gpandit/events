import {useLoaderData} from "react-router";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {OrganizerEventsSection} from "../OrganizerHomepage/OrganizerEventsSection";
import {validateThemeSettings} from "../../../utilites/themeUtils.ts";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";

export const PublicOrganizerEvents = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData?: GenericPaginatedResponse<Event>;
        isPastEvents: boolean;
    };

    if (!loaderData?.organizer) {
        return <OrganizerNotFound/>;
    }

    const {organizer, eventsData, isPastEvents} = loaderData;
    const themeSettings = validateThemeSettings(organizer.settings?.homepage_theme_settings);

    return (
        <OrganizerPageShell organizer={organizer} activeNav="events">
            <OrganizerEventsSection
                organizer={organizer}
                eventsData={eventsData}
                isPastEvents={isPastEvents}
                primaryColor={themeSettings.accent}
            />
        </OrganizerPageShell>
    );
};

export default PublicOrganizerEvents;
