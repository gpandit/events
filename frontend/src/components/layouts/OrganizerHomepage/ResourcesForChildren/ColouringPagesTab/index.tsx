import {useState} from 'react';
import {IconDownload, IconExternalLink} from '@tabler/icons-react';
import {t} from '@lingui/macro';
import {colouringPages} from '../colouringPagesData.ts';
import {useGetShopifyCollection} from '../../../../../queries/useGetShopifyCollection.ts';
import {interleaveShopProducts, ShopifyProduct} from '../../../../../utilites/shopify.ts';
import {ShopProductCard} from './ShopProductCard.tsx';
import {ShopProductModal} from './ShopProductModal.tsx';
import classes from '../ResourcesForChildren.module.scss';

const PAGES_PER_SHOP_PRODUCT = 3;

const ShopBanner = () => (
    <div className={classes.shopBanner}>
        <a
            href="https://icreate.art"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.shopLink}
        >
            {t`Love colouring? Shop creative colouring sets at`}{' '}
            <img src="/logos/icreate-logo.webp" alt={t`I Create`} className={classes.shopLinkLogo}/>
            <IconExternalLink size={16}/>
        </a>
    </div>
);

export const ColouringPagesTab = () => {
    const {data: shopProducts = []} = useGetShopifyCollection();
    const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
    const gridItems = interleaveShopProducts(colouringPages, shopProducts, PAGES_PER_SHOP_PRODUCT);

    return (
        <div className={classes.tabPanel}>
            {colouringPages.length > 0 ? (
                <div className={classes.colouringGrid}>
                    {gridItems.map((item) => item.type === 'product' ? (
                        <ShopProductCard key={item.product.id} product={item.product} onSelect={setSelectedProduct}/>
                    ) : (
                        <div key={item.page.title} className={classes.colouringCard}>
                            <div className={`${classes.colouringTile} ${classes[`tint-${item.page.tint}`]}`}>
                                <img
                                    src={item.page.thumbnailUrl}
                                    alt={item.page.title}
                                    className={classes.colouringThumbnail}
                                    loading="lazy"
                                />
                            </div>
                            <p className={classes.colouringTitle}>{item.page.title}</p>
                            <a href={item.page.pdfUrl} download className={classes.downloadLink}>
                                <IconDownload size={16}/> {t`Download PDF`}
                            </a>
                        </div>
                    ))}

                    <ShopBanner/>
                </div>
            ) : (
                <>
                    <p className={classes.comingSoon}>
                        {t`New colouring sheets are on their way — check back soon!`}
                    </p>
                    <ShopBanner/>
                </>
            )}

            <ShopProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)}/>
        </div>
    );
};

export default ColouringPagesTab;
