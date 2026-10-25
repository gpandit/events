import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {colouringPageClient, ColouringPageDetails, ColouringPageScope} from "../api/colouring-page.client.ts";
import {GET_COLOURING_PAGES_QUERY_KEY} from "../queries/useGetColouringPages.ts";
import {GET_PUBLISHED_COLOURING_PAGES_QUERY_KEY} from "../queries/useGetPublishedColouringPages.ts";

export const useUpdateColouringPage = (scope: ColouringPageScope) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({pageId, details}: { pageId: IdParam; details: ColouringPageDetails }) =>
            colouringPageClient.update(scope, pageId, details),
        onSuccess: () => Promise.all([
            queryClient.invalidateQueries({queryKey: [GET_COLOURING_PAGES_QUERY_KEY, scope]}),
            queryClient.invalidateQueries({queryKey: [GET_PUBLISHED_COLOURING_PAGES_QUERY_KEY]}),
        ]),
    });
};
