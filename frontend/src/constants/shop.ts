import {t} from "@lingui/macro";
import {CollectionStatus, ShopCategory, ShopVendorType} from "../types.ts";

export const SHOP_CATEGORIES: ShopCategory[] = ['UNIFORM', 'PRELOVED_UNIFORM', 'BOOKS_STATIONERY', 'MEALS'];

export const SHOP_VENDOR_TYPES_BY_CATEGORY: Record<ShopCategory, ShopVendorType[]> = {
    UNIFORM: ['SCHOOL', 'EXTERNAL'],
    PRELOVED_UNIFORM: ['SCHOOL', 'PTA'],
    BOOKS_STATIONERY: ['SCHOOL', 'EXTERNAL'],
    MEALS: ['EXTERNAL'],
};

export const shopCategoryLabel = (category: ShopCategory): string => {
    switch (category) {
        case 'UNIFORM':
            return t`New uniform`;
        case 'PRELOVED_UNIFORM':
            return t`Preloved uniform`;
        case 'BOOKS_STATIONERY':
            return t`Textbooks & stationery`;
        case 'MEALS':
            return t`School meals`;
    }
}

export const shopVendorTypeLabel = (vendorType: ShopVendorType): string => {
    switch (vendorType) {
        case 'SCHOOL':
            return t`School`;
        case 'EXTERNAL':
            return t`External vendor`;
        case 'PTA':
            return t`PTA`;
    }
}

export const collectionStatusLabel = (status: CollectionStatus): string => {
    switch (status) {
        case 'PENDING':
            return t`To collect`;
        case 'READY':
            return t`Ready for collection`;
        case 'COLLECTED':
            return t`Collected`;
    }
}
