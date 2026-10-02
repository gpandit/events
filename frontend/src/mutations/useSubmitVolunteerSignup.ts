import {useMutation} from "@tanstack/react-query";
import {contactClient} from "../api/contact.client.ts";

export const useSubmitVolunteerSignup = () => {
    return useMutation({
        mutationFn: (volunteerData: {
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
            message?: string;
        }) => contactClient.submitVolunteerSignup(volunteerData),
    });
};
