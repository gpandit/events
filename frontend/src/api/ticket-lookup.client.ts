import {api} from './client.ts';
import {GenericDataResponse, Order} from "../types.ts";

export const ticketLookupClient = {
    sendTicketLookupEmail: async (email: string) => {
        const response = await api.post<GenericDataResponse<{ message: string }>>('public/ticket-lookup', { email });
        return response.data;
    },

    erasePersonalData: async (token: string, payload: { confirmation: string; password?: string }) => {
        const response = await api.post<{ message: string }>(`public/ticket-lookup/${token}/erase-personal-data`, payload);
        return response.data;
    },

    getOrdersByToken: async (token: string) => {
        const response = await api.get<GenericDataResponse<Order[]>>(`public/ticket-lookup/${token}`);
        return response.data;
    },
}
