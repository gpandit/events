import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {slotBookingClientPublic} from "../api/slot-booking.client.ts";

export const useJoinSlotWaitlist = (eventId: IdParam, customerToken: string) => {
    return useMutation({
        mutationFn: () => slotBookingClientPublic.joinWaitlist(eventId, customerToken),
    });
};
