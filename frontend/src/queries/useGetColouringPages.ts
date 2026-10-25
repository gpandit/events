import {useQuery} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {colouringPageClient} from "../api/colouring-page.client.ts";

export const GET_COLOURING_PAGES_QUERY_KEY = 'getColouringPages';

export const useGetColouringPages = (organizerId: IdParam) => {
    return useQuery({
        queryKey: [GET_COLOURING_PAGES_QUERY_KEY, organizerId],
        queryFn: () => colouringPageClient.all(organizerId),
        enabled: !!organizerId,
    });
};
