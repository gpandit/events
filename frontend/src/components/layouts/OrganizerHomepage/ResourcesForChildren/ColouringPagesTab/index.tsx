import {useState} from 'react';
import {Tabs} from '@mantine/core';
import {IconDownload, IconExternalLink} from '@tabler/icons-react';
import {t} from '@lingui/macro';
import {ColouringPageAgeGroup, IdParam} from '../../../../../types.ts';
import {useGetPublishedColouringPages} from '../../../../../queries/useGetPublishedColouringPages.ts';
import {useGetShopifyCollection} from '../../../../../queries/useGetShopifyCollection.ts';
import {interleaveShopProducts, ShopifyProduct} from '../../../../../utilites/shopify.ts';
import {colouringTintClassName, ColouringAgeGroupOption, getColouringAgeGroups} from '../../../../../utilites/colouringPages.ts';
import {ShopProductCard} from './ShopProductCard.tsx';
import {ShopProductModal} from './ShopProductModal.tsx';
import classes from '../ResourcesForChildren.module.scss';

const PAGES_PER_SHOP_PRODUCT = 3;
const DEFAULT_AGE_GROUP: ColouringPageAgeGroup = 'AGE_6_10';

interface ColouringPagesTabProps {
    organizerId: IdParam;
}

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

interface AgeGroupPanelProps {
    ageGroup: ColouringAgeGroupOption;
    organizerId: IdParam;
    onSelectProduct: (product: ShopifyProduct) => void;
}

const AgeGroupPanel = ({ageGroup, organizerId, onSelectProduct}: AgeGroupPanelProps) => {
    const pagesQuery = useGetPublishedColouringPages(organizerId);
    const {data: shopProducts = []} = useGetShopifyCollection(ageGroup.shopCollectionConfigKey);

    if (!pagesQuery.data) {
        return null;
    }

    const pages = pagesQuery.data.data.filter((page) => page.age_group === ageGroup.value);
    const gridItems = interleaveShopProducts(pages, shopProducts, PAGES_PER_SHOP_PRODUCT);

    if (pages.length === 0) {
        return (
            <>
                <p className={classes.comingSoon}>
                    {t`New colouring sheets are on their way — check back soon!`}
                </p>
                <ShopBanner/>
            </>
        );
    }

    return (
        <div className={classes.colouringGrid}>
            {gridItems.map((item) => item.type === 'product' ? (
                <ShopProductCard key={item.product.id} product={item.product} onSelect={onSelectProduct}/>
            ) : (
                <div key={item.page.id} className={classes.colouringCard}>
                    <div className={`${classes.colouringTile} ${classes[colouringTintClassName(item.page.tint)]}`}>
                        <img
                            src={item.page.thumbnail_url}
                            alt={item.page.title}
                            className={classes.colouringThumbnail}
                            loading="lazy"
                        />
                    </div>
                    <p className={classes.colouringTitle}>{item.page.title}</p>
                    <a
                        href={item.page.pdf_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classes.downloadLink}
                    >
                        <IconDownload size={16}/> {t`Download PDF`}
                    </a>
                </div>
            ))}

            <ShopBanner/>
        </div>
    );
};

export const ColouringPagesTab = ({organizerId}: ColouringPagesTabProps) => {
    const [activeAgeGroup, setActiveAgeGroup] = useState<string | null>(DEFAULT_AGE_GROUP);
    const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
    const ageGroups = getColouringAgeGroups();

    return (
        <div className={classes.tabPanel}>
            <Tabs value={activeAgeGroup} onChange={setActiveAgeGroup} keepMounted={false} className={classes.tabs}>
                <Tabs.List>
                    {ageGroups.map((ageGroup) => (
                        <Tabs.Tab
                            key={ageGroup.value}
                            value={ageGroup.value}
                            data-testid={`colouring-age-tab-${ageGroup.value}`}
                        >
                            {ageGroup.label} <span className={classes.fieldHint}>{ageGroup.ages}</span>
                        </Tabs.Tab>
                    ))}
                </Tabs.List>

                {ageGroups.map((ageGroup) => (
                    <Tabs.Panel key={ageGroup.value} value={ageGroup.value} className={classes.tabPanel}>
                        <AgeGroupPanel
                            ageGroup={ageGroup}
                            organizerId={organizerId}
                            onSelectProduct={setSelectedProduct}
                        />
                    </Tabs.Panel>
                ))}
            </Tabs>

            <ShopProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)}/>
        </div>
    );
};

export default ColouringPagesTab;
