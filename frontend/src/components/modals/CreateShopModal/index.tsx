import {useNavigate} from "react-router";
import {t} from "@lingui/macro";
import {Button, Select, Stack, Textarea, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {GenericModalProps, IdParam, ShopCategory, ShopVendorType} from "../../../types.ts";
import {Modal} from "../../common/Modal";
import {useCreateShop} from "../../../mutations/useCreateShop.ts";
import {useFormErrorResponseHandler} from "../../../hooks/useFormErrorResponseHandler.tsx";
import {
    SHOP_CATEGORIES,
    SHOP_VENDOR_TYPES_BY_CATEGORY,
    shopCategoryLabel,
    shopVendorTypeLabel,
} from "../../../constants/shop.ts";

interface CreateShopModalProps extends GenericModalProps {
    organizerId: IdParam;
}

interface FormValues {
    title: string;
    description: string;
    shop_category: ShopCategory;
    vendor_type: ShopVendorType;
}

export const CreateShopModal = ({onClose, organizerId}: CreateShopModalProps) => {
    const navigate = useNavigate();
    const errorHandler = useFormErrorResponseHandler();
    const createShopMutation = useCreateShop();

    const form = useForm<FormValues>({
        initialValues: {
            title: '',
            description: '',
            shop_category: 'UNIFORM',
            vendor_type: 'SCHOOL',
        },
        validate: {
            title: (value) => value.trim() ? null : t`Shop name is required`,
        },
    });

    const handleCategoryChange = (value: string | null) => {
        if (!value) {
            return;
        }
        const category = value as ShopCategory;
        form.setFieldValue('shop_category', category);
        if (!SHOP_VENDOR_TYPES_BY_CATEGORY[category].includes(form.values.vendor_type)) {
            form.setFieldValue('vendor_type', SHOP_VENDOR_TYPES_BY_CATEGORY[category][0]);
        }
    };

    const handleSubmit = (values: FormValues) => {
        createShopMutation.mutate({
            organizer_id: organizerId,
            title: values.title,
            description: values.description || undefined,
            shop_category: values.shop_category,
            vendor_type: values.vendor_type,
        }, {
            onSuccess: ({data}) => navigate(`/manage/event/${data.id}/products`),
            onError: (error) => errorHandler(form, error),
        });
    };

    return (
        <Modal opened onClose={onClose} heading={t`Create shop`}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Select
                        label={t`Shop category`}
                        data={SHOP_CATEGORIES.map((category) => ({value: category, label: shopCategoryLabel(category)}))}
                        allowDeselect={false}
                        value={form.values.shop_category}
                        onChange={handleCategoryChange}
                        error={form.errors.shop_category}
                        data-testid="shop-category-select"
                    />
                    <Select
                        label={t`Sold by`}
                        data={SHOP_VENDOR_TYPES_BY_CATEGORY[form.values.shop_category].map((vendorType) => ({
                            value: vendorType,
                            label: shopVendorTypeLabel(vendorType),
                        }))}
                        allowDeselect={false}
                        {...form.getInputProps('vendor_type')}
                        data-testid="shop-vendor-type-select"
                    />
                    <TextInput
                        label={t`Shop name`}
                        placeholder={t`e.g. the vendor or school shop name`}
                        {...form.getInputProps('title')}
                    />
                    <Textarea
                        label={t`Description`}
                        autosize
                        minRows={2}
                        {...form.getInputProps('description')}
                    />
                    <Button type="submit" loading={createShopMutation.isPending} data-testid="shop-create-submit-button">
                        {t`Create shop`}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};
