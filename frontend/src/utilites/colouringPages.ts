import {t} from "@lingui/macro";
import {ColouringPageAgeGroup, ColouringPageTint} from "../types.ts";
import {ShopifyCollectionConfigKey} from "./shopify.ts";

export interface ColouringAgeGroupOption {
    value: ColouringPageAgeGroup;
    label: string;
    ages: string;
    shopCollectionConfigKey: ShopifyCollectionConfigKey;
}

export const getColouringAgeGroups = (): ColouringAgeGroupOption[] => [
    {value: 'AGE_2_5', label: t`Little Colourers`, ages: t`Ages 2-5`, shopCollectionConfigKey: 'VITE_SHOPIFY_COLLECTION_AGE_2_5'},
    {value: 'AGE_6_10', label: t`Young Artists`, ages: t`Ages 6-10`, shopCollectionConfigKey: 'VITE_SHOPIFY_COLLECTION_AGE_6_10'},
    {value: 'AGE_11_13', label: t`Creative Explorers`, ages: t`Ages 11-13`, shopCollectionConfigKey: 'VITE_SHOPIFY_COLLECTION_AGE_11_13'},
    {value: 'AGE_14_18', label: t`Studio`, ages: t`Ages 14-18`, shopCollectionConfigKey: 'VITE_SHOPIFY_COLLECTION_AGE_14_18'},
];

export const getColouringTints = (): { value: ColouringPageTint; label: string }[] => [
    {value: 'PEACH', label: t`Peach`},
    {value: 'SKY', label: t`Sky`},
    {value: 'MINT', label: t`Mint`},
    {value: 'LILAC', label: t`Lilac`},
];

export const colouringTintClassName = (tint: ColouringPageTint): string => `tint-${tint.toLowerCase()}`;
