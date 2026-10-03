import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useLoginQuizPlayer = (organizerId: IdParam) => {
    return useMutation({
        mutationFn: (credentials: { username: string; password: string }) =>
            organizerPublicClient.loginQuizPlayer(organizerId, credentials),
    });
};
