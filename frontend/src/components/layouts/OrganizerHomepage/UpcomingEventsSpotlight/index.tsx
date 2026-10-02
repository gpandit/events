import React from 'react';
import {t} from "@lingui/macro";
import {Event} from "../../../../types.ts";
import {NextEventSpotlight} from "../NextEventSpotlight";
import classes from './UpcomingEventsSpotlight.module.scss';

interface UpcomingEventsSpotlightProps {
    events: Event[];
    primaryColor?: string;
}

export const UpcomingEventsSpotlight: React.FC<UpcomingEventsSpotlightProps> = ({events, primaryColor}) => {
    if (events.length === 0) {
        return null;
    }

    if (events.length === 1) {
        return (
            <NextEventSpotlight
                event={events[0]}
                primaryColor={primaryColor}
                eyebrowLabel={t`Next Event`}
            />
        );
    }

    return (
        <div className={classes.grid}>
            {events.map((event, index) => (
                <NextEventSpotlight
                    key={event.id}
                    event={event}
                    primaryColor={primaryColor}
                    compact
                    eyebrowLabel={index === 0 ? t`Next Event` : t`Upcoming`}
                />
            ))}
        </div>
    );
};

export default UpcomingEventsSpotlight;
