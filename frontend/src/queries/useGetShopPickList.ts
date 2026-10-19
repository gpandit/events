import {useQuery} from "@tanstack/react-query";
import {CollectionStatus, IdParam} from "../types.ts";
import {shopClient} from "../api/shop.client.ts";

export const GET_SHOP_PICK_LIST_QUERY_KEY = 'getShopPickList';

export const useGetShopPickList = (eventId: IdParam, collectionStatus: CollectionStatus) => {
    return useQuery({
        queryKey: [GET_SHOP_PICK_LIST_QUERY_KEY, eventId, collectionStatus],

        queryFn: async () => {
            const {data} = await shopClient.getPickList(eventId, collectionStatus);
            return data;
        }
    });
};
