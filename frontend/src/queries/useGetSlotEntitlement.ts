import {useQuery} from "@tanstack/react-query";
import {IdParam, SlotEntitlement} from "../types.ts";
import {slotBookingClientPublic} from "../api/slot-booking.client.ts";

export const GET_SLOT_ENTITLEMENT_QUERY_KEY = "getSlotEntitlement";

export const useGetSlotEntitlement = (eventId: IdParam, customerToken: string) => {
    return useQuery<SlotEntitlement>({
        queryKey: [GET_SLOT_ENTITLEMENT_QUERY_KEY, eventId, customerToken],
        queryFn: () => slotBookingClientPublic.entitlement(eventId, customerToken),
        refetchOnWindowFocus: false,
        retry: false,
    });
};
