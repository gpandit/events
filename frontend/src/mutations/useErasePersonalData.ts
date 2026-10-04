import {useMutation} from "@tanstack/react-query";
import {ticketLookupClient} from "../api/ticket-lookup.client.ts";

export const useErasePersonalData = (token: string) => {
    return useMutation({
        mutationFn: (payload: { confirmation: string; password?: string }) =>
            ticketLookupClient.erasePersonalData(token, payload),
    });
};
