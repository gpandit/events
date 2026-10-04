import {useMutation, useQueryClient} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {shopClient} from "../api/shop.client.ts";
import {GET_SHOP_PICK_LIST_QUERY_KEY} from "../queries/useGetShopPickList.ts";
import {GET_EVENT_ORDERS_QUERY_KEY} from "../queries/useGetEventOrders.ts";

export type OrderCollectionAction = 'ready' | 'collected';

export const useUpdateOrderCollection = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({eventId, orderIds, action}: {
            eventId: IdParam,
            orderIds: IdParam[],
            action: OrderCollectionAction
        }) => action === 'ready'
            ? shopClient.markReadyForCollection(eventId, orderIds)
            : shopClient.markCollected(eventId, orderIds),

        onSuccess: () => Promise.all([
            queryClient.invalidateQueries({queryKey: [GET_SHOP_PICK_LIST_QUERY_KEY]}),
            queryClient.invalidateQueries({queryKey: [GET_EVENT_ORDERS_QUERY_KEY]}),
        ]),
    });
}
