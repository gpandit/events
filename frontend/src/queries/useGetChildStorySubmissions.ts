import {useQuery} from "@tanstack/react-query";
import {ChildStorySubmissionStatus, IdParam} from "../types.ts";
import {organizerClient} from "../api/organizer.client.ts";

export const GET_CHILD_STORY_SUBMISSIONS_QUERY = 'getChildStorySubmissions';

export const useGetChildStorySubmissions = (organizerId: IdParam, status?: ChildStorySubmissionStatus) => {
    return useQuery({
        queryKey: [GET_CHILD_STORY_SUBMISSIONS_QUERY, organizerId, status],
        queryFn: async () => organizerClient.getChildStorySubmissions(organizerId, status),
        enabled: !!organizerId,
    });
};
