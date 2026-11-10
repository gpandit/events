import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {slotBookingClientPublic} from "../api/slot-booking.client.ts";

export const useBuyGrotto = (ticketEventId: IdParam, customerToken: string) => {
    return useMutation({
        mutationFn: ({grottoProductId, quantities}: {
            grottoProductId: IdParam,
            quantities: { price_id: number; quantity: number }[],
        }) => slotBookingClientPublic.buyGrotto(ticketEventId, customerToken, grottoProductId, quantities),
    });
};
