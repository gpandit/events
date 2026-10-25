import {useQuery} from "@tanstack/react-query";
import {colouringPageClient, ColouringPageScope} from "../api/colouring-page.client.ts";

export const GET_COLOURING_PAGES_QUERY_KEY = 'getColouringPages';

export const useGetColouringPages = (scope: ColouringPageScope) => {
    return useQuery({
        queryKey: [GET_COLOURING_PAGES_QUERY_KEY, scope],
        queryFn: () => colouringPageClient.all(scope),
        enabled: !!scope,
    });
};
