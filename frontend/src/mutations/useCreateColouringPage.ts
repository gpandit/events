import {useMutation, useQueryClient} from "@tanstack/react-query";
import {colouringPageClient, ColouringPageScope, CreateColouringPageRequest} from "../api/colouring-page.client.ts";
import {GET_COLOURING_PAGES_QUERY_KEY} from "../queries/useGetColouringPages.ts";
import {GET_PUBLISHED_COLOURING_PAGES_QUERY_KEY} from "../queries/useGetPublishedColouringPages.ts";

export const useCreateColouringPage = (scope: ColouringPageScope) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateColouringPageRequest) => colouringPageClient.create(scope, request),
        onSuccess: () => Promise.all([
            queryClient.invalidateQueries({queryKey: [GET_COLOURING_PAGES_QUERY_KEY, scope]}),
            queryClient.invalidateQueries({queryKey: [GET_PUBLISHED_COLOURING_PAGES_QUERY_KEY]}),
        ]),
    });
};
