import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useSubmitChildStorySubmission = (organizerId: IdParam) => {
    return useMutation({
        mutationFn: (submission: {
            type: 'STORY' | 'POEM';
            first_name: string;
            last_name: string;
            year_group: string;
            content: string;
            original_filename?: string;
            consent_own_work: boolean;
            consent_publish: boolean;
            is_under_16: boolean;
            parent_email?: string;
            turnstile_token?: string;
        }) => organizerPublicClient.submitChildStorySubmission(organizerId, submission),
    });
};
