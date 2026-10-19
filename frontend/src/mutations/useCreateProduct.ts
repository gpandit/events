import {IdParam, Product} from "../types.ts";
import {productClient} from "../api/product.client.ts";
import {imageClient} from "../api/image.client.ts";
import {queryClient} from "../utilites/queryClient.ts";
import {GET_EVENT_PRODUCT_CATEGORIES_QUERY_KEY} from "../queries/useGetProductCategories.ts";
import {GET_EVENT_QUERY_KEY} from "../queries/useGetEvent.ts";
import {extractImageUploadErrors} from "../utilites/imageUploadValidation.ts";
import {showError} from "../utilites/notifications.tsx";
import {useMutation} from "@tanstack/react-query";

export const useCreateProduct = () => {
    return useMutation({
        mutationFn: async ({productData, eventId}: {
            eventId: IdParam,
            productData: Product,
        }) => {
            const {pending_images: pendingImages = [], images: _images, ...payload} = productData;
            const response = await productClient.create(eventId, payload as Product);

            for (const file of pendingImages) {
                try {
                    await imageClient.uploadImage(file, 'PRODUCT_IMAGE', response.data.id);
                } catch (error) {
                    showError(extractImageUploadErrors(error)[0]);
                    break;
                }
            }

            return response;
        },

        onSuccess: (_, variables) => {
            return Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [GET_EVENT_PRODUCT_CATEGORIES_QUERY_KEY, variables.eventId],
                }),
                queryClient.invalidateQueries({queryKey: [GET_EVENT_QUERY_KEY]}),
            ]);
        }
    });
}
