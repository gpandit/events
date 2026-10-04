import {useQuery} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const GET_QUIZ_USERNAME_OPTIONS_QUERY = 'getQuizUsernameOptions';

export const useGetQuizUsernameOptions = (organizerId: IdParam) => {
    return useQuery({
        queryKey: [GET_QUIZ_USERNAME_OPTIONS_QUERY, organizerId],
        queryFn: async () => (await organizerPublicClient.getQuizUsernameOptions(organizerId)).data,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};
