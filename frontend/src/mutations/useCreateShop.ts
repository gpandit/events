import {useMutation, useQueryClient} from "@tanstack/react-query";
import {CreateShopRequest, shopClient} from "../api/shop.client.ts";
import {GET_EVENTS_QUERY_KEY} from "../queries/useGetEvents.ts";

export const useCreateShop = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (shop: CreateShopRequest) => shopClient.create(shop),

        onSuccess: () => queryClient.invalidateQueries({queryKey: [GET_EVENTS_QUERY_KEY]}),
    });
}
