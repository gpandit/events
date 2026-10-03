import {useQuery} from "@tanstack/react-query";
import {orderClientPublic} from "../api/order.client.ts";
import {IdParam} from "../types.ts";

export const GET_PAYMENT_PROCESSING_FEE_QUERY_KEY = 'getPaymentProcessingFee';

export const useGetPaymentProcessingFee = (eventId: IdParam, orderShortId: IdParam) => {
    return useQuery({
        queryKey: [GET_PAYMENT_PROCESSING_FEE_QUERY_KEY, eventId, orderShortId],
        queryFn: () => orderClientPublic.getPaymentProcessingFee(eventId, orderShortId),
        retry: false,
        staleTime: 0,
    });
}
