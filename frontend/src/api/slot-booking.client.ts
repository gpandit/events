import {api} from "./client";
import {publicApi} from "./public-client";
import {BookSlotRequest, GenerateSlotsRequest, GenericDataResponse, IdParam, Order, SlotEntitlement, StaffBookFamilyRequest} from "../types";

const CUSTOMER_TOKEN_HEADER = 'X-Customer-Token';

export const slotBookingClient = {
    generateSlots: async (eventId: IdParam, data: GenerateSlotsRequest) => {
        const response = await api.post<{ created: number }>(`events/${eventId}/occurrences/generate-slots`, data);
        return response.data;
    },

    staffBookFamily: async (eventId: IdParam, data: StaffBookFamilyRequest) => {
        const response = await api.post(`events/${eventId}/slot-bookings`, data);
        return response.data;
    },
};

export const slotBookingClientPublic = {
    book: async (eventId: IdParam, customerToken: string, data: BookSlotRequest) => {
        const response = await publicApi.post(`events/${eventId}/slot-bookings`, data, {
            headers: {[CUSTOMER_TOKEN_HEADER]: customerToken},
        });
        return response.data;
    },

    entitlement: async (eventId: IdParam, customerToken: string) => {
        const response = await publicApi.get<GenericDataResponse<SlotEntitlement>>(`events/${eventId}/slot-entitlement`, {
            headers: {[CUSTOMER_TOKEN_HEADER]: customerToken},
        });
        return response.data.data;
    },

    buyGrotto: async (
        ticketEventId: IdParam,
        customerToken: string,
        grottoProductId: IdParam,
        quantities: { price_id: number; quantity: number }[],
    ) => {
        const response = await publicApi.post<GenericDataResponse<Order>>(
            `events/${ticketEventId}/order`,
            {
                products: [{product_id: grottoProductId, quantities}],
                promo_code: null,
            },
            {headers: {[CUSTOMER_TOKEN_HEADER]: customerToken}},
        );
        return response.data.data;
    },

    joinWaitlist: async (eventId: IdParam, customerToken: string) => {
        const response = await publicApi.post(`events/${eventId}/slot-waitlist`, {}, {
            headers: {[CUSTOMER_TOKEN_HEADER]: customerToken},
        });
        return response.data;
    },
};
