import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useRequestQuizUsernameReminder = (organizerId: IdParam) => {
    return useMutation({
        mutationFn: (email: string) => organizerPublicClient.requestQuizUsernameReminder(organizerId, email),
    });
};
