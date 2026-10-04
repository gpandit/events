import {useMutation} from "@tanstack/react-query";
import {IdParam} from "../types.ts";
import {organizerPublicClient} from "../api/organizer.client.ts";

export const useRegisterQuizPlayer = (organizerId: IdParam) => {
    return useMutation({
        mutationFn: (player: {
            first_name: string;
            email: string;
            age_band: string;
            password: string;
        }) => organizerPublicClient.registerQuizPlayer(organizerId, player),
    });
};
