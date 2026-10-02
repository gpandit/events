import {GenericDataResponse} from "../types";
import {publicApi} from "./public-client.ts";

export const contactClient = {
    submitSiteContact: async (contactData: {
        name: string;
        email: string;
        message: string;
    }) => {
        const response = await publicApi.post<GenericDataResponse<any>>('contact', contactData);
        return response.data;
    },
    submitVolunteerSignup: async (volunteerData: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        message?: string;
    }) => {
        const response = await publicApi.post<GenericDataResponse<any>>('volunteer', volunteerData);
        return response.data;
    },
};
