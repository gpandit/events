import {useQuery} from "@tanstack/react-query";
import {IdParam, QueryFilters} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const GET_ORGANIZER_SHOPS_PUBLIC_QUERY = 'getOrganizerPublicShops';

export const getOrganizerPublicShopsQuery = (organizerId: IdParam, pagination: QueryFilters) => ({
    queryKey: [GET_ORGANIZER_SHOPS_PUBLIC_QUERY, organizerId, pagination],

    queryFn: async () => {
        return await organizerPublicClient.getShops(organizerId, pagination);
    }
});

export const useGetOrganizerPublicShops = (organizerId: IdParam, pagination: QueryFilters) => {
    return useQuery(getOrganizerPublicShopsQuery(organizerId, pagination));
}
