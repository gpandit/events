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
};
