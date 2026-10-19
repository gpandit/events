import {t} from "@lingui/macro";
import {UseFormReturnType} from "@mantine/form";
import {Dropzone, IMAGE_MIME_TYPE} from "@mantine/dropzone";
import {ActionIcon, Loader} from "@mantine/core";
import {IconPhotoPlus, IconTrash} from "@tabler/icons-react";
import {useState} from "react";
import {IdParam, Image, Product} from "../../../types.ts";
import {useUploadImage} from "../../../mutations/useUploadImage.ts";
import {useDeleteImage} from "../../../mutations/useDeleteImage.ts";
import {showError} from "../../../utilites/notifications.tsx";
import {extractImageUploadErrors, IMAGE_MAX_UPLOAD_SIZE, validateImageFile} from "../../../utilites/imageUploadValidation.ts";
import {MAX_PRODUCT_IMAGES, previewUrlFor} from "./pendingImages.ts";
import classes from "./ProductForm.module.scss";

interface ProductImagesFieldProps {
    form: UseFormReturnType<Product>;
    productId?: IdParam;
}

export const ProductImagesField = ({form, productId}: ProductImagesFieldProps) => {
    const [uploading, setUploading] = useState(false);
    const uploadImage = useUploadImage();
    const deleteImage = useDeleteImage();
    const savedImages: Image[] = form.values.images ?? [];
    const pendingImages: File[] = form.values.pending_images ?? [];
    const remainingSlots = MAX_PRODUCT_IMAGES - savedImages.length - pendingImages.length;

    const handleDrop = async (files: File[]) => {
        const accepted = files.slice(0, Math.max(remainingSlots, 0));
        const invalid = accepted.map(validateImageFile).find((message) => message !== null);
        if (invalid) {
            showError(invalid);
            return;
        }

        if (!productId) {
            form.setFieldValue('pending_images', [...pendingImages, ...accepted]);
            return;
        }

        setUploading(true);
        let uploaded: Image[] = [];
        for (const file of accepted) {
            try {
                const response = await uploadImage.mutateAsync({
                    image: file,
                    imageType: 'PRODUCT_IMAGE',
                    entityId: productId,
                });
                uploaded = [...uploaded, response.data];
            } catch (error) {
                showError(extractImageUploadErrors(error)[0]);
                break;
            }
        }
        form.setFieldValue('images', [...savedImages, ...uploaded]);
        setUploading(false);
    };

    const removeSaved = (image: Image) => {
        deleteImage.mutate({imageId: image.id}, {
            onSuccess: () => form.setFieldValue('images', savedImages.filter((item) => item.id !== image.id)),
            onError: () => showError(t`Something went wrong while deleting the image. Please try again.`),
        });
    };

    const removePending = (index: number) => {
        form.setFieldValue('pending_images', pendingImages.filter((_, position) => position !== index));
    };

    const tiles = [
        ...savedImages.map((image) => ({key: `saved-${image.id}`, url: image.url, onRemove: () => removeSaved(image)})),
        ...pendingImages.map((file, index) => ({key: `pending-${index}`, url: previewUrlFor(file), onRemove: () => removePending(index)})),
    ];

    return (
        <div className={classes.imagesField} data-testid="product-images-field">
            <div className={classes.imagesFieldLabel}>{t`Photos`}</div>
            <div className={classes.imageGrid}>
                {tiles.map((tile, index) => (
                    <div key={tile.key} className={classes.imageTile}>
                        <img src={tile.url} alt=""/>
                        {index === 0 && <span className={classes.imageTileBadge}>{t`Main`}</span>}
                        <ActionIcon
                            className={classes.imageTileRemove}
                            size="sm"
                            variant="filled"
                            color="red"
                            aria-label={t`Remove photo`}
                            onClick={tile.onRemove}
                        >
                            <IconTrash size={12}/>
                        </ActionIcon>
                    </div>
                ))}
                {remainingSlots > 0 && (
                    <Dropzone
                        className={classes.imageDrop}
                        accept={IMAGE_MIME_TYPE}
                        maxSize={IMAGE_MAX_UPLOAD_SIZE}
                        onDrop={handleDrop}
                        onReject={() => showError(t`File is too large. Maximum size is 5MB.`)}
                        disabled={uploading}
                        data-testid="product-images-dropzone"
                    >
                        {uploading ? <Loader size="sm"/> : <IconPhotoPlus size={22}/>}
                        <span>{t`Add photos`}</span>
                    </Dropzone>
                )}
            </div>
        </div>
    );
};
