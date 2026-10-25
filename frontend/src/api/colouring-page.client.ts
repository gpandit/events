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

export const SHARED_COLOURING_PAGES = 'shared';

export type ColouringPageScope = IdParam | typeof SHARED_COLOURING_PAGES;

const basePath = (scope: ColouringPageScope) =>
    scope === SHARED_COLOURING_PAGES ? 'admin/colouring-pages' : `organizers/${scope}/colouring-pages`;

export const colouringPageClient = {
    all: async (scope: ColouringPageScope) => {
        const response = await api.get<GenericDataResponse<ColouringPage[]>>(basePath(scope));
        return response.data;
    },

    create: async (scope: ColouringPageScope, request: CreateColouringPageRequest) => {
        const formData = new FormData();
        formData.append('title', request.title);
        formData.append('age_group', request.age_group);
        formData.append('tint', request.tint);
        formData.append('status', request.status);
        formData.append('pdf', request.pdf);
        formData.append('thumbnail', request.thumbnail);

        const response = await api.post<GenericDataResponse<ColouringPage>>(
            basePath(scope),
            formData,
            {headers: {'Content-Type': 'multipart/form-data'}}
        );
        return response.data;
    },

    update: async (scope: ColouringPageScope, pageId: IdParam, details: ColouringPageDetails) => {
        const response = await api.put<GenericDataResponse<ColouringPage>>(
            `${basePath(scope)}/${pageId}`,
            details
        );
        return response.data;
    },

    delete: async (scope: ColouringPageScope, pageId: IdParam) => {
        await api.delete(`${basePath(scope)}/${pageId}`);
    },

    reorder: async (scope: ColouringPageScope, pageIds: number[]) => {
        await api.put(`${basePath(scope)}/order`, {page_ids: pageIds});
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
