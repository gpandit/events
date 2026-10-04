import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useRespondToParentalConsent = (organizerId: IdParam, token: string) => {
    return useMutation({
        mutationFn: (granted: boolean) => organizerPublicClient.respondToParentalConsent(organizerId, token, granted),
    });
};
