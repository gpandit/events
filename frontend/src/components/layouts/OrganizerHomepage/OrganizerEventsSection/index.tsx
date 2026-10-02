import React from 'react';
import {useNavigate} from "react-router";
import {t} from "@lingui/macro";
import {Event, GenericPaginatedResponse, Organizer} from "../../../../types.ts";
import {EventCard} from '../EventCard';
import {Pagination} from "../../../common/Pagination";
import {organizerEventsPath} from "../../../../utilites/urlHelper.ts";
import classes from '../OrganizerHomepage.module.scss';

interface OrganizerEventsSectionProps {
    organizer: Organizer;
    eventsData?: GenericPaginatedResponse<Event>;
    isPastEvents?: boolean;
    primaryColor?: string;
}

export const OrganizerEventsSection: React.FC<OrganizerEventsSectionProps> = ({
                                                                                    organizer,
                                                                                    eventsData,
                                                                                    isPastEvents = false,
                                                                                    primaryColor,
                                                                                }) => {
    const navigate = useNavigate();
    const events = eventsData?.data || [];

    const handleFilterChange = (showPastEvents: boolean) => {
        if (showPastEvents) {
            navigate(`${organizerEventsPath(organizer)}/past-events`);
        } else {
            navigate(organizerEventsPath(organizer));
        }
    };

    return (
        <div className={classes.eventsSection}>
            <div className={classes.eventsHeader}>
                <h2 className={classes.eventsTitle}>
                    {isPastEvents ? t`Past Events` : t`Upcoming Events`}
                </h2>
                <div className={classes.filterToggle}>
                    <button
                        className={`${classes.filterButton} ${!isPastEvents ? classes.filterButtonActive : ''}`}
                        onClick={() => handleFilterChange(false)}
                    >
                        {t`Upcoming`}
                    </button>
                    <button
                        className={`${classes.filterButton} ${isPastEvents ? classes.filterButtonActive : ''}`}
                        onClick={() => handleFilterChange(true)}
                    >
                        {t`Past`}
                    </button>
                </div>
            </div>

            <div className={classes.eventsList}>
                {events.length === 0 ? (
                    <div className={classes.noEvents}>
                        <p>{isPastEvents ? t`No past events` : t`No upcoming events`}</p>
                    </div>
                ) : (
                    <div className={classes.eventsContainer}>
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event as Event}
                                primaryColor={primaryColor}
                            />
                        ))}
                    </div>
                )}
            </div>

            {eventsData && eventsData.meta.total > eventsData.meta.per_page && (
                <div className={classes.paginationWrapper}>
                    <Pagination
                        size="sm"
                        siblings={1}
                        marginTop={0}
                        total={eventsData.meta.last_page}
                        value={eventsData.meta.current_page}
                        onChange={(page) => {
                            const newPath = isPastEvents
                                ? `${organizerEventsPath(organizer)}/past-events?page=${page}`
                                : `${organizerEventsPath(organizer)}?page=${page}`;
                            navigate(newPath);
                        }}
                        className={classes.paginationComponent}
                    />
                </div>
            )}
        </div>
    );
};

export default OrganizerEventsSection;
