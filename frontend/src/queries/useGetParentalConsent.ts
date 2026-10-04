import {useQuery} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const GET_PARENTAL_CONSENT_QUERY = 'getParentalConsent';

export const useGetParentalConsent = (organizerId: IdParam, token: string) => {
    return useQuery({
        queryKey: [GET_PARENTAL_CONSENT_QUERY, organizerId, token],
        queryFn: async () => (await organizerPublicClient.getParentalConsent(organizerId, token)).data,
        retry: false,
    });
};
