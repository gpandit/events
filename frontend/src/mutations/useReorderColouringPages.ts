import {useMutation, useQueryClient} from "@tanstack/react-query";
import {colouringPageClient, ColouringPageScope} from "../api/colouring-page.client.ts";
import {GET_COLOURING_PAGES_QUERY_KEY} from "../queries/useGetColouringPages.ts";
import {GET_PUBLISHED_COLOURING_PAGES_QUERY_KEY} from "../queries/useGetPublishedColouringPages.ts";

export const useReorderColouringPages = (scope: ColouringPageScope) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (pageIds: number[]) => colouringPageClient.reorder(scope, pageIds),
        onSuccess: () => Promise.all([
            queryClient.invalidateQueries({queryKey: [GET_COLOURING_PAGES_QUERY_KEY, scope]}),
            queryClient.invalidateQueries({queryKey: [GET_PUBLISHED_COLOURING_PAGES_QUERY_KEY]}),
        ]),
    });
};
