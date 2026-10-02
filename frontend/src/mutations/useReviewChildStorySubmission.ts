import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ChildStorySubmissionStatus, IdParam} from "../types.ts";
import {organizerClient} from "../api/organizer.client.ts";
import {GET_CHILD_STORY_SUBMISSIONS_QUERY} from "../queries/useGetChildStorySubmissions.ts";

export const useReviewChildStorySubmission = (organizerId: IdParam) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({submissionId, status}: { submissionId: IdParam; status: ChildStorySubmissionStatus }) =>
            organizerClient.reviewChildStorySubmission(organizerId, submissionId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [GET_CHILD_STORY_SUBMISSIONS_QUERY, organizerId]});
        },
    });
};
