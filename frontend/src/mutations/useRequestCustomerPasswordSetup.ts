import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useRequestCustomerPasswordSetup = (organizerId: IdParam) => {
    return useMutation({
        mutationFn: (email: string) => organizerPublicClient.requestCustomerPasswordSetup(organizerId, email),
    });
};
