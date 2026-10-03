import {useMutation, useQueryClient} from "@tanstack/react-query";
import {orderClientPublic} from "../api/order.client.ts";
import {IdParam} from "../types.ts";
import {GET_ORDER_PUBLIC_QUERY_KEY} from "../queries/useGetOrderPublic.ts";
import {GET_PAYMENT_PROCESSING_FEE_QUERY_KEY} from "../queries/useGetPaymentProcessingFee.ts";

export const useSetPaymentProcessingFeeCoverage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({eventId, orderShortId, cover}: {
            eventId: IdParam,
            orderShortId: IdParam,
            cover: boolean,
        }) => orderClientPublic.setPaymentProcessingFeeCoverage(eventId, orderShortId, cover),
        onSuccess: (_quote, {eventId, orderShortId}) => Promise.all([
            queryClient.invalidateQueries({queryKey: [GET_PAYMENT_PROCESSING_FEE_QUERY_KEY, eventId, orderShortId]}),
            queryClient.invalidateQueries({queryKey: [GET_ORDER_PUBLIC_QUERY_KEY]}),
        ]),
    });
}
