import {useMutation} from "@tanstack/react-query";
import {BookSlotRequest, IdParam} from "../types.ts";
import {slotBookingClientPublic} from "../api/slot-booking.client.ts";

export const useBookSlot = (eventId: IdParam, customerToken: string) => {
    return useMutation({
        mutationFn: (data: BookSlotRequest) => slotBookingClientPublic.book(eventId, customerToken, data),
    });
};
