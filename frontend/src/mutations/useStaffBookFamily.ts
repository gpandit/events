import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IdParam, StaffBookFamilyRequest} from "../types.ts";
import {slotBookingClient} from "../api/slot-booking.client.ts";
import {GET_EVENT_OCCURRENCES_QUERY_KEY} from "../queries/useGetEventOccurrences.ts";

export const useStaffBookFamily = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({eventId, data}: { eventId: IdParam, data: StaffBookFamilyRequest }) =>
            slotBookingClient.staffBookFamily(eventId, data),

        onSuccess: () => queryClient.invalidateQueries({queryKey: [GET_EVENT_OCCURRENCES_QUERY_KEY]}),
    });
};
