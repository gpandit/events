import {t} from "@lingui/macro";
import {UseFormReturnType} from "@mantine/form";
import {ActionIcon, Button, NumberInput, TextInput} from "@mantine/core";
import {IconPlus, IconTrash, IconTrashOff} from "@tabler/icons-react";
import {Event, Product, ProductPrice, ProductQuantityAppliesTo} from "../../../types.ts";
import {getCurrencySymbol} from "../../../utilites/currency.ts";
import {showError} from "../../../utilites/notifications.tsx";
import classes from "./ProductForm.module.scss";

interface ProductSizesFormProps {
    form: UseFormReturnType<Product>;
    product?: Product;
    event?: Event;
}

const SIZE_PRESETS: Array<{ id: string; label: string; sizes: string[] }> = [
    {id: 'ages', label: t`Ages 3–14`, sizes: ['3-4 yrs', '5-6 yrs', '7-8 yrs', '9-10 yrs', '11-12 yrs', '13-14 yrs']},
    {id: 'letters', label: t`XS – XXL`, sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']},
    {id: 'shoes', label: t`Shoes 10–6`, sizes: ['UK 10', 'UK 11', 'UK 12', 'UK 13', 'UK 1', 'UK 2', 'UK 3', 'UK 4', 'UK 5', 'UK 6']},
];

export const ProductSizesForm = ({form, product, event}: ProductSizesFormProps) => {
    const prices: ProductPrice[] = form.values.prices ?? [];
    const currencySymbol = event?.currency ? getCurrencySymbol(event.currency) : '';

    const newSize = (label?: string): ProductPrice => ({
        price: prices[0]?.price ?? 0,
        compare_at_price: prices[0]?.compare_at_price,
        label,
        quantity_applies_to: ProductQuantityAppliesTo.Event,
    });

    const applyPreset = (sizes: string[]) => {
        const existing = prices.filter((price) => price.label || price.id);
        const existingLabels = new Set(existing.map((price) => price.label));
        const added = sizes.filter((size) => !existingLabels.has(size)).map(newSize);
        form.setFieldValue('prices', [...existing, ...added]);
    };

    const removeSize = (index: number) => {
        const existingPrice = product?.prices?.find((p) => Number(p.id) === Number(prices[index]?.id));
        if (Number(existingPrice?.quantity_sold) > 0) {
            showError(t`This size has already been sold, so it can't be deleted. Hide it instead.`);
            return;
        }
        if (prices.length === 1) {
            showError(t`You must have at least one size`);
            return;
        }
        form.removeListItem('prices', index);
    };

    return (
        <div className={classes.sizesForm} data-testid="product-sizes-form">
            <div className={classes.sizesPresets}>
                <span>{t`Add sizes:`}</span>
                {SIZE_PRESETS.map((preset) => (
                    <Button
                        key={preset.id}
                        size="compact-xs"
                        variant="light"
                        data-testid={`product-size-preset-${preset.id}`}
                        onClick={() => applyPreset(preset.sizes)}
                    >
                        {preset.label}
                    </Button>
                ))}
            </div>

            <div className={classes.sizesHeader}>
                <span>{t`Size`}</span>
                <span>{t`Price`}</span>
                <span>{t`Regular price`}</span>
                <span>{t`Stock`}</span>
                <span/>
            </div>

            {prices.map((price, index) => {
                const sold = Number(product?.prices?.find((p) => Number(p.id) === Number(price.id))?.quantity_sold) > 0;
                return (
                    <div key={`size-${index}`} className={classes.sizesRow} data-testid={`product-size-row-${index}`}>
                        <TextInput
                            aria-label={t`Size`}
                            placeholder={t`Age 7-8`}
                            {...form.getInputProps(`prices.${index}.label`)}
                        />
                        <NumberInput
                            aria-label={t`Price`}
                            decimalScale={2}
                            min={0}
                            fixedDecimalScale
                            leftSection={currencySymbol}
                            {...form.getInputProps(`prices.${index}.price`)}
                        />
                        <NumberInput
                            aria-label={t`Regular price`}
                            decimalScale={2}
                            min={0}
                            fixedDecimalScale
                            leftSection={currencySymbol}
                            placeholder={t`Optional`}
                            {...form.getInputProps(`prices.${index}.compare_at_price`)}
                        />
                        <NumberInput
                            aria-label={t`Stock`}
                            min={0}
                            placeholder={t`Unlimited`}
                            {...form.getInputProps(`prices.${index}.initial_quantity_available`)}
                        />
                        <ActionIcon
                            variant="light"
                            aria-label={t`Remove size`}
                            onClick={() => removeSize(index)}
                        >
                            {sold ? <IconTrashOff size="1rem"/> : <IconTrash size="1rem"/>}
                        </ActionIcon>
                    </div>
                );
            })}

            <Button
                size="xs"
                variant="light"
                leftSection={<IconPlus size={14}/>}
                data-testid="product-add-size-button"
                onClick={() => form.insertListItem('prices', newSize())}
            >
                {t`Add size`}
            </Button>
        </div>
    );
};
