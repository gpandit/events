import {useQuery} from "@tanstack/react-query";
import {fetchShopifyCollection, getShopifyConfig, ShopifyCollectionConfigKey, getShopifyCollectionHandle} from "../utilites/shopify.ts";

export const GET_SHOPIFY_COLLECTION_QUERY_KEY = 'getShopifyCollection';

export const useGetShopifyCollection = (collectionConfigKey: ShopifyCollectionConfigKey) => {
    const collectionHandle = getShopifyConfig() ? getShopifyCollectionHandle(collectionConfigKey) : undefined;

    return useQuery({
        queryKey: [GET_SHOPIFY_COLLECTION_QUERY_KEY, collectionHandle],

        queryFn: () => fetchShopifyCollection(collectionHandle as string),

        enabled: Boolean(collectionHandle),
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
};
