import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useSubmitQuizResult = (organizerId: IdParam) => {
    return useMutation({
        mutationFn: (result: {
            first_name: string;
            last_name: string;
            email: string;
            age_band: string;
            score: number;
            total_questions: number;
        }) => organizerPublicClient.submitQuizResult(organizerId, result),
    });
};
