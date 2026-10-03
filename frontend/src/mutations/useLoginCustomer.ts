import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useLoginCustomer = (organizerId: IdParam) => {
    return useMutation({
        mutationFn: (credentials: { email: string; password: string }) => organizerPublicClient.loginCustomer(organizerId, credentials),
    });
};
