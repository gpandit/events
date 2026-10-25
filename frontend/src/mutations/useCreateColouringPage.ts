import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {colouringPageClient, CreateColouringPageRequest} from "../api/colouring-page.client.ts";
import {GET_COLOURING_PAGES_QUERY_KEY} from "../queries/useGetColouringPages.ts";
import {GET_PUBLISHED_COLOURING_PAGES_QUERY_KEY} from "../queries/useGetPublishedColouringPages.ts";

export const useCreateColouringPage = (organizerId: IdParam) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateColouringPageRequest) => colouringPageClient.create(organizerId, request),
        onSuccess: () => Promise.all([
            queryClient.invalidateQueries({queryKey: [GET_COLOURING_PAGES_QUERY_KEY, organizerId]}),
            queryClient.invalidateQueries({queryKey: [GET_PUBLISHED_COLOURING_PAGES_QUERY_KEY]}),
        ]),
    });
};
