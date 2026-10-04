import {api} from "./client";
import {
    CollectionStatus,
    GenericDataResponse,
    IdParam,
    Event,
    ShopCategory,
    ShopPickListRow,
    ShopVendorType,
} from "../types";

export interface CreateShopRequest {
    organizer_id: IdParam;
    title: string;
    description?: string;
    shop_category: ShopCategory;
    vendor_type: ShopVendorType;
}

export const shopClient = {
    create: async (shop: CreateShopRequest) => {
        const response = await api.post<GenericDataResponse<Event>>('shops', shop);
        return response.data;
    },

    getPickList: async (eventId: IdParam, collectionStatus: CollectionStatus) => {
        const response = await api.get<GenericDataResponse<ShopPickListRow[]>>(
            `events/${eventId}/shop/pick-list`,
            {params: {collection_status: collectionStatus}}
        );
        return response.data;
    },

    markReadyForCollection: async (eventId: IdParam, orderIds: IdParam[]) => {
        const response = await api.post<{ updated: number }>(
            `events/${eventId}/shop/orders/ready-for-collection`,
            {order_ids: orderIds}
        );
        return response.data;
    },

    markCollected: async (eventId: IdParam, orderIds: IdParam[]) => {
        const response = await api.post<{ updated: number }>(
            `events/${eventId}/shop/orders/collected`,
            {order_ids: orderIds}
        );
        return response.data;
    },
}
