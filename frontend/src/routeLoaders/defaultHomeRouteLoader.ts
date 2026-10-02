import {getQueryClient} from "../utilites/ssrQueryClient.ts";
import {getConfig} from "../utilites/config.ts";
import {getOrganizerPublicQuery} from "../queries/useGetOrganizerPublic.ts";
import {getOrganizerPublicEventsQuery} from "../queries/useGetOrganizerEventsPublic.ts";

export const defaultHomeRouteLoader = async () => {
    const organizerId = getConfig('VITE_DEFAULT_ORGANIZER_ID');

    if (!organizerId) {
        return {organizer: null, eventsData: null, isPastEvents: false};
    }

    try {
        const organizer = await getQueryClient().fetchQuery(getOrganizerPublicQuery(organizerId));

        const eventsData = await getQueryClient().fetchQuery(
            getOrganizerPublicEventsQuery(organizerId, {
                pageNumber: 1,
                perPage: 30,
                sortBy: 'start_date',
                sortDirection: 'asc',
                additionalParams: {
                    eventsStatus: 'upcoming',
                },
                filterFields: {},
            })
        );

        return {organizer, eventsData, isPastEvents: false};
    } catch (error: any) {
        if (error?.response?.status === 404) {
            return {organizer: null, eventsData: null, isPastEvents: false};
        }
        throw error;
    }
};
