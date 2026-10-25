import {LoaderFunctionArgs} from "react-router";
import {getConfig} from "../utilites/config.ts";
import {redirectToCanonicalOrganizerPath} from "./redirectToCanonicalOrganizerPath.ts";
import {getQueryClient} from "../utilites/ssrQueryClient.ts";
import {getOrganizerPublicQuery} from "../queries/useGetOrganizerPublic.ts";
import {getOrganizerPublicEventsQuery} from "../queries/useGetOrganizerEventsPublic.ts";

export const publicOrganizerRouteLoader = async ({params, request}: LoaderFunctionArgs) => {
    const organizerId = params.organizerId ?? getConfig('VITE_DEFAULT_ORGANIZER_ID');
    const url = new URL(request.url);
    const isPastEvents = url.pathname.endsWith('/past-events');
    const pageNumber = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1;

    if (!organizerId) {
        return {organizer: null, eventsData: null, isPastEvents};
    }

    try {
        const organizer = await getQueryClient().fetchQuery(getOrganizerPublicQuery(organizerId));

        redirectToCanonicalOrganizerPath(organizer, request.url);

        let filter = {};
        if (!isPastEvents) {
            filter = {
                additionalParams: {
                    eventsStatus: 'upcoming',
                },
                filterFields: {}
            };
        } else {
            filter = {
                additionalParams: {
                    eventsStatus: 'ended',
                },
                filterFields: {}
            };
        }

        const eventsData = await getQueryClient().fetchQuery(
            getOrganizerPublicEventsQuery(organizerId, {
                pageNumber: pageNumber,
                perPage: 30,
                sortBy: 'start_date',
                sortDirection: isPastEvents ? 'desc' : 'asc',
                ...filter
            })
        );

        return {
            organizer,
            eventsData,
            isPastEvents
        };
    } catch (error: any) {
        if (error instanceof Response) {
            throw error;
        }

        if (error?.response?.status === 404) {
            return {organizer: null, eventsData: null, isPastEvents};
        }
        throw error;
    }
}
