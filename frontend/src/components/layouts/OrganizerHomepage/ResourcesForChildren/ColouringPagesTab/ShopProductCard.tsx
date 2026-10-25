import {t} from '@lingui/macro';
import {formatShopifyPrice, ShopifyProduct} from '../../../../../utilites/shopify.ts';
import classes from '../ResourcesForChildren.module.scss';

interface ShopProductCardProps {
    product: ShopifyProduct;
    onOpen: () => void;
}

export const ShopProductCard = ({product, onOpen}: ShopProductCardProps) => (
    <button
        type="button"
        className={`${classes.colouringCard} ${classes.shopCard}`}
        onClick={onOpen}
        data-testid="shop-product-card"
    >
        <div className={`${classes.colouringTile} ${classes.shopTile}`}>
            {product.imageUrl && (
                <img
                    src={product.imageUrl}
                    alt={product.imageAlt}
                    className={classes.colouringThumbnail}
                    loading="lazy"
                />
            )}
            <span className={classes.shopBadge}>{t`Shop`}</span>
        </div>
        <p className={classes.colouringTitle}>{product.title}</p>
        <span className={classes.shopPrice}>{formatShopifyPrice(product.variants[0].price)}</span>
    </button>
);
