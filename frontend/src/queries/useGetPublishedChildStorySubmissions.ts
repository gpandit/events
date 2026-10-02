import {useQuery} from "@tanstack/react-query";
import {IdParam, QueryFilters} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const GET_PUBLISHED_CHILD_STORY_SUBMISSIONS_QUERY = 'getPublishedChildStorySubmissions';

export const useGetPublishedChildStorySubmissions = (organizerId: IdParam, pagination: QueryFilters, options?: {enabled?: boolean}) => {
    return useQuery({
        queryKey: [GET_PUBLISHED_CHILD_STORY_SUBMISSIONS_QUERY, organizerId, pagination],
        queryFn: async () => organizerPublicClient.getPublishedChildStorySubmissions(organizerId, pagination),
        enabled: options?.enabled ?? true,
    });
};
