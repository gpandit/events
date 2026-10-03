import {useQuery} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const GET_QUIZ_PLAYER_PROFILE_QUERY = 'getQuizPlayerProfile';

export const useGetQuizPlayerProfile = (organizerId: IdParam, token: string | null) => {
    return useQuery({
        queryKey: [GET_QUIZ_PLAYER_PROFILE_QUERY, organizerId, token],
        queryFn: async () => (await organizerPublicClient.getQuizPlayerProfile(organizerId, token as string)).data,
        enabled: token !== null,
        retry: false,
    });
};
