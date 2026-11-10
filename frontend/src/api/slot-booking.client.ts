import {api} from "./client";
import {publicApi} from "./public-client";
import {BookSlotRequest, GenerateSlotsRequest, IdParam, StaffBookFamilyRequest} from "../types";

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

    joinWaitlist: async (eventId: IdParam, customerToken: string) => {
        const response = await publicApi.post(`events/${eventId}/slot-waitlist`, {}, {
            headers: {[CUSTOMER_TOKEN_HEADER]: customerToken},
        });
        return response.data;
    },
};
