import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";
import {GET_QUIZ_LEADERBOARD_QUERY} from "../queries/useGetQuizLeaderboard.ts";
import {GET_QUIZ_PLAYER_PROFILE_QUERY} from "../queries/useGetQuizPlayerProfile.ts";

export const useSubmitQuizResult = (organizerId: IdParam, token: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (result: {
            age_band: string;
            score: number;
            total_questions: number;
        }) => organizerPublicClient.submitQuizResult(organizerId, token, result),
        onSuccess: () => Promise.all([
            queryClient.invalidateQueries({queryKey: [GET_QUIZ_PLAYER_PROFILE_QUERY]}),
            queryClient.invalidateQueries({queryKey: [GET_QUIZ_LEADERBOARD_QUERY]}),
        ]),
    });
};
