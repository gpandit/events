import {useMutation, useQueryClient} from "@tanstack/react-query";
import {GenerateSlotsRequest, IdParam} from "../types.ts";
import {slotBookingClient} from "../api/slot-booking.client.ts";
import {GET_EVENT_OCCURRENCES_QUERY_KEY} from "../queries/useGetEventOccurrences.ts";
import {GET_EVENT_QUERY_KEY} from "../queries/useGetEvent.ts";

export const useGenerateSlots = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({eventId, data}: { eventId: IdParam, data: GenerateSlotsRequest }) =>
            slotBookingClient.generateSlots(eventId, data),

        onSuccess: () => Promise.all([
            queryClient.invalidateQueries({queryKey: [GET_EVENT_OCCURRENCES_QUERY_KEY]}),
            queryClient.invalidateQueries({queryKey: [GET_EVENT_QUERY_KEY]}),
        ]),
    });
};
