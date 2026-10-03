import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useRegisterCustomer = (organizerId: IdParam) => {
    return useMutation({
        mutationFn: (customer: { first_name: string; last_name: string; email: string; phone?: string }) => organizerPublicClient.registerCustomer(organizerId, customer),
    });
};
