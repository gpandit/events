import {useQuery} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {colouringPagePublicClient} from "../api/colouring-page.client.ts";

export const GET_PUBLISHED_COLOURING_PAGES_QUERY_KEY = 'getPublishedColouringPages';

export const useGetPublishedColouringPages = (organizerId: IdParam) => {
    return useQuery({
        queryKey: [GET_PUBLISHED_COLOURING_PAGES_QUERY_KEY, organizerId],
        queryFn: () => colouringPagePublicClient.published(organizerId),
        enabled: !!organizerId,
    });
};
