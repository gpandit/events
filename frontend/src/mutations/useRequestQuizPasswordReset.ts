import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useRequestQuizPasswordReset = (organizerId: IdParam) => {
    return useMutation({
        mutationFn: (username: string) => organizerPublicClient.requestQuizPasswordReset(organizerId, username),
    });
};
