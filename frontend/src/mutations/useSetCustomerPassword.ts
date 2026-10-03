import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useSetCustomerPassword = (organizerId: IdParam) => {
    return useMutation({
        mutationFn: (payload: { token: string; password: string }) => organizerPublicClient.setCustomerPassword(organizerId, payload),
    });
};
