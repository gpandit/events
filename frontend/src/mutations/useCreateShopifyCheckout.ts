import {useMutation} from "@tanstack/react-query";
import {createShopifyCheckoutUrl} from "../utilites/shopify.ts";

export const useCreateShopifyCheckout = () => {
    return useMutation({
        mutationFn: createShopifyCheckoutUrl,
    });
};
