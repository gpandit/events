import {t} from "@lingui/macro";
import {Event, GenericPaginatedResponse, Organizer} from "../../../types.ts";
import {OrganizerPageShell} from "./OrganizerPageShell";
import {OrganizerHero} from "./OrganizerHero";
import {UpcomingEventsSpotlight} from './UpcomingEventsSpotlight';
import {OrganizerProfileCard} from "./OrganizerProfileCard";
import {ResourcesForChildren} from "./ResourcesForChildren";
import {organizerEventsPath} from "../../../utilites/urlHelper.ts";
import {validateThemeSettings} from "../../../utilites/themeUtils.ts";
import classes from './OrganizerHomepage.module.scss';

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
                <>
                    <h2 className={classes.upcomingHeading}>{t`What's happening at RAB`}</h2>
                    <UpcomingEventsSpotlight
                        events={upcomingEvents}
                        primaryColor={themeSettings.accent}
                    />
                    <div className={classes.sectionDivider} role="separator" aria-hidden="true">
                        <span className={classes.sectionDividerMark}/>
                    </div>
                </>
            )}

            {isFirstPage && !isPastEvents && <ResourcesForChildren organizer={organizer}/>}

            <OrganizerProfileCard organizer={organizer}/>
        </OrganizerPageShell>
    );
};

export default OrganizerHomepage;
