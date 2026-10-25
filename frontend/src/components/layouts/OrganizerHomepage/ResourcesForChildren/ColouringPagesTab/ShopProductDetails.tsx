import {useState} from 'react';
import {Select} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconExternalLink} from '@tabler/icons-react';
import {formatShopifyPrice, ShopifyProduct} from '../../../../../utilites/shopify.ts';
import {useCreateShopifyCheckout} from '../../../../../mutations/useCreateShopifyCheckout.ts';
import {showError} from '../../../../../utilites/notifications.tsx';
import classes from '../ResourcesForChildren.module.scss';

interface ShopProductDetailsProps {
    product: ShopifyProduct;
}

export const ShopProductDetails = ({product}: ShopProductDetailsProps) => {
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const checkoutMutation = useCreateShopifyCheckout();

    const variant = product.variants.find((candidate) => candidate.id === selectedVariantId) ?? product.variants[0];

    const handleBuyNow = () => {
        const checkoutTab = window.open('about:blank', '_blank');
        if (checkoutTab) {
            checkoutTab.opener = null;
        }

        checkoutMutation.mutate(variant.id, {
            onSuccess: (checkoutUrl) => {
                if (checkoutTab) {
                    checkoutTab.location.href = checkoutUrl;
                } else {
                    window.location.assign(checkoutUrl);
                }
            },
            onError: () => {
                checkoutTab?.close();
                showError(t`Could not start checkout. Please try again.`);
            },
        });
    };

    return (
        <div className={classes.shopModalBody}>
            {product.imageUrl && (
                <img src={product.imageUrl} alt={product.imageAlt} className={classes.shopModalImage}/>
            )}

            <p className={classes.shopModalPrice}>{formatShopifyPrice(variant.price)}</p>

            {product.variants.length > 1 && (
                <Select
                    label={t`Option`}
                    data={product.variants.map(({id, title}) => ({value: id, label: title}))}
                    value={variant.id}
                    onChange={setSelectedVariantId}
                    allowDeselect={false}
                />
            )}

            <button
                type="button"
                className={classes.primaryButton}
                onClick={handleBuyNow}
                disabled={checkoutMutation.isPending}
                data-testid="shop-buy-now-button"
            >
                {t`Buy now`} <IconExternalLink size={16}/>
            </button>
            <p className={classes.fieldHint}>{t`Secure checkout opens in a new tab`}</p>
        </div>
    );
};
