import {api} from "./client";
import {
    ChildStorySubmission,
    ChildStorySubmissionStatus,
    CustomerSession,
    Event,
    GenericDataResponse,
    GenericPaginatedResponse,
    IdParam,
    Order,
    Organizer,
    OrganizerSettings,
    OrganizerStats,
    ParentalConsentDetails,
    PublishedChildStorySubmission,
    QueryFilters,
    QuizLeaderboardEntry,
    QuizPlayerProfile,
    QuizPlayerSession,
    QuizResultOutcome,
} from "../types";
import {queryParamsHelper} from "../utilites/queryParamsHelper.ts";
import {publicApi} from "./public-client.ts";

export const organizerClient = {
    create: async (organizer: Partial<Organizer>) => {
        const response = await api.post<GenericDataResponse<Organizer>>('organizers', organizer);
        return response.data;
    },

    all: async () => {
        const response = await api.get<GenericPaginatedResponse<Organizer>>('organizers');
        return response.data;
    },

    update: async (organizerId: IdParam, organizer: Partial<Organizer>) => {
        const response = await api.post<GenericDataResponse<Organizer>>('organizers/' + organizerId, organizer);
        return response.data;
    },

    findByID: async (organizerId: IdParam) => {
        const response = await api.get<GenericDataResponse<Organizer>>('organizers/' + organizerId);
        return response.data;
    },

    delete: async (organizerId: IdParam) => {
        const response = await api.delete('organizers/' + organizerId);
        return response.data;
    },

    getDeletionStatus: async (organizerId: IdParam) => {
        const response = await api.get<GenericDataResponse<{ can_delete: boolean; reason?: string }>>('organizers/' + organizerId + '/deletion-status');
        return response.data;
    },

    updateStatus: async (organizerId: IdParam, status: string) => {
        const response = await api.put<GenericDataResponse<Organizer>>('organizers/' + organizerId + '/status', {
            status
        });
        return response.data;
    },

    updateLocation: async (organizerId: IdParam, locationId: IdParam | null) => {
        const response = await api.patch<GenericDataResponse<Organizer>>('organizers/' + organizerId + '/location', {
            location_id: locationId,
        });
        return response.data;
    },

    findEventsByOrganizerId: async (organizerId: IdParam, pagination: QueryFilters) => {
        const response = await api.get<GenericPaginatedResponse<Event>>(
            'organizers/' + organizerId + '/events' + queryParamsHelper.buildQueryString(pagination)
        );
        return response.data;
    },

    getOrganizerStats: async (
        organizerId: IdParam,
        options: {currencyCode: string; startDate?: string; endDate?: string},
    ) => {
        const params = new URLSearchParams();
        params.append('currency_code', options.currencyCode);
        if (options.startDate) params.append('start_date', options.startDate);
        if (options.endDate) params.append('end_date', options.endDate);
        const response = await api.get<GenericDataResponse<OrganizerStats>>(
            `organizers/${organizerId}/stats?${params.toString()}`,
        );
        return response.data;
    },

    getOrganizerOrders: async (organizerId: IdParam, pagination: QueryFilters) => {
        const response = await api.get<GenericPaginatedResponse<Order>>(
            `organizers/${organizerId}/orders` + queryParamsHelper.buildQueryString(pagination),
        );
        return response.data;
    },

    getOrganizerReport: async (
        organizerId: IdParam,
        reportType: string,
        startDate?: string | null,
        endDate?: string | null,
        currency?: string | null,
        eventId?: IdParam | null,
        page?: number,
        perPage?: number
    ) => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (currency) params.append('currency', currency);
        if (eventId) params.append('event_id', String(eventId));
        if (page) params.append('page', String(page));
        if (perPage) params.append('per_page', String(perPage));

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get<{
            data: any[];
            pagination?: {
                total: number;
                page: number;
                per_page: number;
                last_page: number;
            };
        }>(
            `organizers/${organizerId}/reports/${reportType}${queryString}`
        );
        return response.data;
    },

    exportOrganizerReport: async (
        organizerId: IdParam,
        reportType: string,
        startDate?: string | null,
        endDate?: string | null,
        currency?: string | null,
        eventId?: IdParam | null
    ): Promise<Blob> => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (currency) params.append('currency', currency);
        if (eventId) params.append('event_id', String(eventId));

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get(
            `organizers/${organizerId}/reports/${reportType}/export${queryString}`,
            { responseType: 'blob' }
        );

        return new Blob([response.data]);
    },

    getChildStorySubmissions: async (organizerId: IdParam, status?: ChildStorySubmissionStatus) => {
        const query = status ? `?status=${status}` : '';
        const response = await api.get<GenericPaginatedResponse<ChildStorySubmission>>(
            `organizers/${organizerId}/child-story-submissions${query}`
        );
        return response.data;
    },

    reviewChildStorySubmission: async (organizerId: IdParam, submissionId: IdParam, status: ChildStorySubmissionStatus) => {
        const response = await api.put<GenericDataResponse<ChildStorySubmission>>(
            `organizers/${organizerId}/child-story-submissions/${submissionId}/review`,
            {status}
        );
        return response.data;
    },
}

export const organizerPublicClient = {
    findByID: async (organizerId: IdParam) => {
        const response = await publicApi.get<GenericDataResponse<Organizer>>('organizers/' + organizerId);
        return response.data;
    },

    findEventsByOrganizerId: async (organizerId: IdParam, pagination: QueryFilters) => {
        const response = await publicApi.get<GenericPaginatedResponse<Event>>(
            'organizers/' + organizerId + '/events' + queryParamsHelper.buildQueryString(pagination)
        );
        return response.data;
    },

    getEvents: async (organizerId: IdParam, pagination: QueryFilters) => {
        const response = await publicApi.get<GenericPaginatedResponse<Event>>(
            'organizers/' + organizerId + '/events' + queryParamsHelper.buildQueryString(pagination)
        );
        return response.data;
    },

    contactOrganizer: async (organizerId: IdParam, contactData: {
        name: string;
        email: string;
        message: string;
    }) => {
        const response = await publicApi.post<GenericDataResponse<any>>(
            `organizers/${organizerId}/contact`,
            contactData
        );
        return response.data;
    },

    submitChildStorySubmission: async (organizerId: IdParam, submission: {
        type: 'STORY' | 'POEM';
        first_name: string;
        last_name: string;
        year_group: string;
        content: string;
        original_filename?: string;
        consent_own_work: boolean;
        consent_publish: boolean;
        is_under_16: boolean;
        parent_email?: string;
        turnstile_token?: string;
    }) => {
        const response = await publicApi.post<GenericDataResponse<ChildStorySubmission>>(
            `organizers/${organizerId}/child-story-submissions`,
            submission
        );
        return response.data;
    },

    getParentalConsent: async (organizerId: IdParam, token: string) => {
        const response = await publicApi.get<GenericDataResponse<ParentalConsentDetails>>(
            `organizers/${organizerId}/parental-consents/${encodeURIComponent(token)}`
        );
        return response.data;
    },

    respondToParentalConsent: async (organizerId: IdParam, token: string, granted: boolean) => {
        const response = await publicApi.post<{ message: string }>(
            `organizers/${organizerId}/parental-consents/${encodeURIComponent(token)}`,
            {granted}
        );
        return response.data;
    },

    getQuizUsernameOptions: async (organizerId: IdParam) => {
        const response = await publicApi.get<GenericDataResponse<string[]>>(
            `organizers/${organizerId}/quiz-players/username-options`
        );
        return response.data;
    },

    registerQuizPlayer: async (organizerId: IdParam, player: {
        username: string;
        first_name: string;
        email: string;
        age_band: string;
        password: string;
    }) => {
        const response = await publicApi.post<GenericDataResponse<QuizPlayerSession>>(
            `organizers/${organizerId}/quiz-players/register`,
            player
        );
        return response.data;
    },

    loginQuizPlayer: async (organizerId: IdParam, credentials: { username: string; password: string }) => {
        const response = await publicApi.post<GenericDataResponse<QuizPlayerSession>>(
            `organizers/${organizerId}/quiz-players/login`,
            credentials
        );
        return response.data;
    },

    getQuizPlayerProfile: async (organizerId: IdParam, token: string) => {
        const response = await publicApi.get<GenericDataResponse<QuizPlayerProfile>>(
            `organizers/${organizerId}/quiz-players/me`,
            {headers: {'X-Quiz-Token': token}}
        );
        return response.data;
    },

    submitQuizResult: async (organizerId: IdParam, token: string, result: {
        age_band: string;
        score: number;
        total_questions: number;
    }) => {
        const response = await publicApi.post<GenericDataResponse<QuizResultOutcome>>(
            `organizers/${organizerId}/quiz-results`,
            result,
            {headers: {'X-Quiz-Token': token}}
        );
        return response.data;
    },

    requestQuizUsernameReminder: async (organizerId: IdParam, email: string) => {
        const response = await publicApi.post<{ message: string }>(
            `organizers/${organizerId}/quiz-players/forgot-username`,
            {email}
        );
        return response.data;
    },

    requestQuizPasswordReset: async (organizerId: IdParam, username: string) => {
        const response = await publicApi.post<{ message: string }>(
            `organizers/${organizerId}/quiz-players/forgot-password`,
            {username}
        );
        return response.data;
    },

    resetQuizPlayerPassword: async (organizerId: IdParam, payload: { token: string; password: string }) => {
        const response = await publicApi.post<GenericDataResponse<QuizPlayerSession>>(
            `organizers/${organizerId}/quiz-players/reset-password`,
            payload
        );
        return response.data;
    },

    registerCustomer: async (organizerId: IdParam, customer: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
    }) => {
        const response = await publicApi.post<{ message: string }>(
            `organizers/${organizerId}/customers/register`,
            customer
        );
        return response.data;
    },

    requestCustomerPasswordSetup: async (organizerId: IdParam, email: string) => {
        const response = await publicApi.post<{ message: string }>(
            `organizers/${organizerId}/customers/forgot-password`,
            {email}
        );
        return response.data;
    },

    setCustomerPassword: async (organizerId: IdParam, payload: { token: string; password: string }) => {
        const response = await publicApi.post<GenericDataResponse<CustomerSession>>(
            `organizers/${organizerId}/customers/set-password`,
            payload
        );
        return response.data;
    },

    loginCustomer: async (organizerId: IdParam, credentials: { email: string; password: string }) => {
        const response = await publicApi.post<GenericDataResponse<CustomerSession>>(
            `organizers/${organizerId}/customers/login`,
            credentials
        );
        return response.data;
    },

    getQuizLeaderboard: async (organizerId: IdParam, ageBand: string) => {
        const response = await publicApi.get<GenericDataResponse<QuizLeaderboardEntry[]>>(
            `organizers/${organizerId}/quiz-leaderboard`,
            {params: {age_band: ageBand}}
        );
        return response.data;
    },

    getPublishedChildStorySubmissions: async (organizerId: IdParam, pagination: QueryFilters) => {
        const response = await publicApi.get<GenericPaginatedResponse<PublishedChildStorySubmission>>(
            `organizers/${organizerId}/child-story-submissions` + queryParamsHelper.buildQueryString(pagination)
        );
        return response.data;
    },
}

export const organizerSettingsClient = {
    partialUpdate: async (organizerId: IdParam, settings: Partial<OrganizerSettings>) => {
        const response = await api.patch<GenericDataResponse<OrganizerSettings>>('organizers/' + organizerId + '/settings', settings);
        return response.data;
    },

    all: async (organizerId: IdParam) => {
        const response = await api.get<GenericDataResponse<OrganizerSettings>>('organizers/' + organizerId + '/settings');
        return response.data;
    },
}
