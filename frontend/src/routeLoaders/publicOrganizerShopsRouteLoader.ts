import {LoaderFunctionArgs, redirect} from "react-router";
import {getQueryClient} from "../utilites/ssrQueryClient.ts";
import {getOrganizerPublicQuery} from "../queries/useGetOrganizerPublic.ts";
import {getOrganizerPublicShopsQuery} from "../queries/useGetOrganizerShopsPublic.ts";

export const publicOrganizerShopsRouteLoader = async ({params, request}: LoaderFunctionArgs) => {
    const {organizerId, organizerSlug} = params;

    if (!organizerId) {
        throw new Error('Organizer ID is required');
    }

    try {
        const organizer = await getQueryClient().fetchQuery(getOrganizerPublicQuery(organizerId));

        if (organizer && organizer.slug && organizerSlug !== organizer.slug) {
            const url = new URL(request.url);
            throw redirect(`/events/${organizer.id}/${organizer.slug}/shop${url.search}`);
        }

        const shopsData = await getQueryClient().fetchQuery(
            getOrganizerPublicShopsQuery(organizerId, {pageNumber: 1, perPage: 100})
        );

        return {organizer, shopsData};
    } catch (error: any) {
        if (error?.response?.status === 404) {
            return {organizer: null, shopsData: null};
        }
        throw error;
    }
}
