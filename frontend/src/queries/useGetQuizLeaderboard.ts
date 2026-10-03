import {useQuery} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const GET_QUIZ_LEADERBOARD_QUERY = 'getQuizLeaderboard';

export const useGetQuizLeaderboard = (organizerId: IdParam, ageBand: string) => {
    return useQuery({
        queryKey: [GET_QUIZ_LEADERBOARD_QUERY, organizerId, ageBand],
        queryFn: async () => (await organizerPublicClient.getQuizLeaderboard(organizerId, ageBand)).data,
    });
};
