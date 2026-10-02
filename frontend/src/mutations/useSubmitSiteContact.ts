import {useMutation} from "@tanstack/react-query";
import {contactClient} from "../api/contact.client.ts";

export const useSubmitSiteContact = () => {
    return useMutation({
        mutationFn: (contactData: {
            name: string;
            email: string;
            message: string;
        }) => contactClient.submitSiteContact(contactData),
    });
};
