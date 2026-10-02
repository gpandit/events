import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "./OrganizerPageShell";
import {OrganizerHero} from "./OrganizerHero";
import {UpcomingEventsSpotlight} from './UpcomingEventsSpotlight';
import {OrganizerProfileCard} from "./OrganizerProfileCard";
import {organizerEventsPath} from "../../../utilites/urlHelper.ts";
import {validateThemeSettings} from "../../../utilites/themeUtils.ts";

interface OrganizerHomepageProps {
    organizer?: Organizer;
    eventsData?: GenericPaginatedResponse<Event>
    isPastEvents?: boolean;
}

export const OrganizerHomepage = ({
                                      organizer,
                                      eventsData,
                                      isPastEvents = false,
                                  }: OrganizerHomepageProps) => {
    if (!organizer) {
        return null;
    }

    const events = eventsData?.data || [];
    const isFirstPage = (eventsData?.meta.current_page ?? 1) === 1;
    const upcomingEvents = (!isPastEvents && isFirstPage) ? events.slice(0, 3) as Event[] : [];

    const themeSettings = validateThemeSettings(organizer.settings?.homepage_theme_settings);

    return (
        <OrganizerPageShell
            organizer={organizer}
            activeNav="home"
            hero={
                <OrganizerHero
                    organizer={organizer}
                    themeSettings={themeSettings}
                    ctaHref={organizerEventsPath(organizer)}
                />
            }
        >
            {upcomingEvents.length > 0 && (
                <UpcomingEventsSpotlight
                    events={upcomingEvents}
                    primaryColor={themeSettings.accent}
                />
            )}

            <OrganizerProfileCard organizer={organizer}/>
        </OrganizerPageShell>
    );
};

export default OrganizerHomepage;
