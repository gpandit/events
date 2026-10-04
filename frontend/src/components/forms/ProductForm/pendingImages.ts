import {Image} from "../../../types.ts";

const previewUrls = new WeakMap<File, string>();

export const MAX_PRODUCT_IMAGES = 8;

export const previewUrlFor = (file: File): string => {
    let url = previewUrls.get(file);
    if (!url) {
        url = URL.createObjectURL(file);
        previewUrls.set(file, url);
    }

    return url;
};

export const pendingFilesToImages = (files: File[] = []): Image[] => files.map((file, index) => ({
    id: `pending-${index}`,
    file_name: file.name,
    url: previewUrlFor(file),
    size: file.size,
    mime_type: file.type,
    type: 'PRODUCT_IMAGE',
}));
