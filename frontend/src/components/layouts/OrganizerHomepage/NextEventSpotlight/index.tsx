import React from 'react';
import {Link} from "react-router";
import {t} from "@lingui/macro";
import {isLightColor} from "@mantine/core";
import {IconArrowRight, IconCalendar, IconMapPin, IconTicket, IconWifi} from '@tabler/icons-react';
import {Event, LocationType} from "../../../../types.ts";
import {formatDateWithLocale, isSameDayInTimezone} from "../../../../utilites/dates.ts";
import {formatCurrency} from "../../../../utilites/currency.ts";
import {eventHomepagePath} from "../../../../utilites/urlHelper.ts";
import {getProductsFromEvent} from "../../../../utilites/helpers.ts";
import {summariseEventLocations} from "../../../../utilites/effectiveLocation.ts";
import {formatAddress} from "../../../../utilites/addressUtilities.ts";
import classes from './NextEventSpotlight.module.scss';

interface NextEventSpotlightProps {
    event: Event;
    primaryColor?: string;
    compact?: boolean;
    eyebrowLabel?: string;
}

export const NextEventSpotlight: React.FC<NextEventSpotlightProps> = ({
    event,
    primaryColor = '#8b5cf6',
    compact = false,
    eyebrowLabel,
}) => {
    const dateTextColor = isLightColor(primaryColor) ? '#000000' : '#ffffff';

    const hasStartDate = !!event.start_date;
    const startMonth = formatDateWithLocale(event.start_date, "monthShort", event.timezone);
    const startDay = formatDateWithLocale(event.start_date, "dayOfMonth", event.timezone);
    const startTime = formatDateWithLocale(event.start_date, "timeOnly", event.timezone);
    const endTime = event.end_date ? formatDateWithLocale(event.end_date, "timeOnly", event.timezone) : null;
    const prettyTimezone = formatDateWithLocale(event.start_date, "timezone", event.timezone);

    const isSameDay = !!event.end_date && isSameDayInTimezone(event.start_date, event.end_date, event.timezone);
    const endMonth = event.end_date ? formatDateWithLocale(event.end_date, "monthShort", event.timezone) : null;
    const endDay = event.end_date ? formatDateWithLocale(event.end_date, "dayOfMonth", event.timezone) : null;

    const coverImage = event.images?.find(img => img.type === 'EVENT_COVER');
    const locationSummary = summariseEventLocations(event);
    const isOnlineEvent = locationSummary.kind === 'single' && locationSummary.eventLocation.type === LocationType.Online;
    const locationLabel: string | null = (() => {
        if (locationSummary.kind === 'none') return null;
        if (locationSummary.kind === 'varied') {
            return locationSummary.types.length > 1 ? t`Online & in-person` : t`Multiple locations`;
        }
        const eventLocation = locationSummary.eventLocation;
        if (eventLocation.type === LocationType.Online) return t`Online`;
        const city = eventLocation.location?.structured_address?.city;
        const venueName = eventLocation.location?.name || eventLocation.location?.structured_address?.venue_name;
        const formatted = eventLocation.location?.structured_address ? formatAddress(eventLocation.location.structured_address) : '';
        return venueName ?? city ?? (formatted ? formatted : null);
    })();
    const location = !isOnlineEvent ? locationLabel : null;

    const products = getProductsFromEvent(event) || [];

    let lowestPrice: number | null = null;
    let highestPrice: number | null = null;

    products.forEach(product => {
        if (product.prices && product.prices.length > 0) {
            product.prices.forEach(price => {
                const priceValue = price.price || 0;
                if (lowestPrice === null || priceValue < lowestPrice) {
                    lowestPrice = priceValue;
                }
                if (highestPrice === null || priceValue > highestPrice) {
                    highestPrice = priceValue;
                }
            });
        } else {
            const priceValue = product.price || 0;
            if (lowestPrice === null || priceValue < lowestPrice) {
                lowestPrice = priceValue;
            }
            if (highestPrice === null || priceValue > highestPrice) {
                highestPrice = priceValue;
            }
        }
    });

    const eventPath = eventHomepagePath(event);

    return (
        <Link to={eventPath} className={classes.spotlightLink}>
            <article className={`${classes.spotlight} ${compact ? classes.spotlightCompact : ''}`}>
                <div className={`${classes.imageWrapper} ${compact ? classes.imageWrapperCompact : ''}`}>
                    {coverImage ? (
                        <img
                            src={coverImage.url}
                            alt={event.title}
                            loading="lazy"
                            className={classes.coverImage}
                        />
                    ) : (
                        <div className={classes.placeholderImage}
                             style={{'--date-text-color': dateTextColor} as React.CSSProperties}>
                            <IconTicket size={48}/>
                        </div>
                    )}
                    {hasStartDate && (
                        <div className={classes.dateBadge}>
                            <span className={classes.dateBadgeMonth}>{startMonth}</span>
                            <span className={classes.dateBadgeDay}>{startDay}</span>
                        </div>
                    )}
                </div>

                <div className={classes.content}>
                    <span className={classes.eyebrow}>{eyebrowLabel ?? t`Next Event`}</span>
                    <h2 className={classes.title}>{event.title}</h2>

                    <div className={classes.metaRow}>
                        {hasStartDate && (
                            <div className={classes.metaItem}>
                                <IconCalendar size={16}/>
                                <span>
                                    {startTime}
                                    {endTime && (
                                        <>
                                            {!isSameDay
                                                ? ` - ${endMonth} ${endDay}, ${endTime}`
                                                : ` - ${endTime}`
                                            }
                                        </>
                                    )}
                                    {prettyTimezone && (
                                        <span title={event.timezone} className={classes.timezone}> ({prettyTimezone})</span>
                                    )}
                                </span>
                            </div>
                        )}
                        {(location || isOnlineEvent) && (
                            <div className={classes.metaItem}>
                                {isOnlineEvent ? (
                                    <><IconWifi size={16}/><span>{t`Online Event`}</span></>
                                ) : (
                                    <><IconMapPin size={16}/><span>{location}</span></>
                                )}
                            </div>
                        )}
                    </div>

                    {event.description_preview && (
                        <p className={classes.description}>{event.description_preview}</p>
                    )}

                    <div className={classes.footer}>
                        {lowestPrice !== null && (
                            <span className={lowestPrice === 0 && highestPrice === 0 ? classes.free : classes.price}>
                                {lowestPrice === 0 && highestPrice === 0 ? (
                                    t`Free`
                                ) : highestPrice !== null && highestPrice !== lowestPrice ? (
                                    `${formatCurrency(lowestPrice, event.currency)} - ${formatCurrency(highestPrice, event.currency)}`
                                ) : (
                                    formatCurrency(lowestPrice, event.currency)
                                )}
                            </span>
                        )}
                        <span className={classes.cta}>
                            {t`Get Tickets`}
                            <IconArrowRight size={16}/>
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default NextEventSpotlight;
