import {LoaderFunctionArgs} from "react-router";
import {getConfig} from "../utilites/config.ts";
import {redirectToCanonicalOrganizerPath} from "./redirectToCanonicalOrganizerPath.ts";
import {getQueryClient} from "../utilites/ssrQueryClient.ts";
import {getOrganizerPublicQuery} from "../queries/useGetOrganizerPublic.ts";
import {getOrganizerPublicShopsQuery} from "../queries/useGetOrganizerShopsPublic.ts";

export const publicOrganizerShopsRouteLoader = async ({params, request}: LoaderFunctionArgs) => {
    const organizerId = params.organizerId ?? getConfig('VITE_DEFAULT_ORGANIZER_ID');

    if (!organizerId) {
        return {organizer: null, shopsData: null};
    }

    try {
        const organizer = await getQueryClient().fetchQuery(getOrganizerPublicQuery(organizerId));

        redirectToCanonicalOrganizerPath(organizer, request.url);

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
