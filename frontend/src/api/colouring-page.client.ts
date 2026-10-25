import {api} from "./client.ts";
import {publicApi} from "./public-client.ts";
import {
    ColouringPage,
    ColouringPageAgeGroup,
    ColouringPageStatus,
    ColouringPageTint,
    GenericDataResponse,
    IdParam,
    PublicColouringPage,
} from "../types.ts";

export interface ColouringPageDetails {
    title: string;
    age_group: ColouringPageAgeGroup;
    tint: ColouringPageTint;
    status: ColouringPageStatus;
}

export interface CreateColouringPageRequest extends ColouringPageDetails {
    pdf: File;
    thumbnail: File;
}

export const colouringPageClient = {
    all: async (organizerId: IdParam) => {
        const response = await api.get<GenericDataResponse<ColouringPage[]>>(`organizers/${organizerId}/colouring-pages`);
        return response.data;
    },

    create: async (organizerId: IdParam, request: CreateColouringPageRequest) => {
        const formData = new FormData();
        formData.append('title', request.title);
        formData.append('age_group', request.age_group);
        formData.append('tint', request.tint);
        formData.append('status', request.status);
        formData.append('pdf', request.pdf);
        formData.append('thumbnail', request.thumbnail);

        const response = await api.post<GenericDataResponse<ColouringPage>>(
            `organizers/${organizerId}/colouring-pages`,
            formData,
            {headers: {'Content-Type': 'multipart/form-data'}}
        );
        return response.data;
    },

    update: async (organizerId: IdParam, pageId: IdParam, details: ColouringPageDetails) => {
        const response = await api.put<GenericDataResponse<ColouringPage>>(
            `organizers/${organizerId}/colouring-pages/${pageId}`,
            details
        );
        return response.data;
    },

    delete: async (organizerId: IdParam, pageId: IdParam) => {
        await api.delete(`organizers/${organizerId}/colouring-pages/${pageId}`);
    },

    reorder: async (organizerId: IdParam, pageIds: number[]) => {
        await api.put(`organizers/${organizerId}/colouring-pages/order`, {page_ids: pageIds});
    },
};

export const colouringPagePublicClient = {
    published: async (organizerId: IdParam) => {
        const response = await publicApi.get<GenericDataResponse<PublicColouringPage[]>>(
            `organizers/${organizerId}/colouring-pages`
        );
        return response.data;
    },
};
