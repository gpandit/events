import {useState} from 'react';
import {Tabs} from '@mantine/core';
import {IconDownload, IconExternalLink} from '@tabler/icons-react';
import {t} from '@lingui/macro';
import {ColouringPageAgeGroup, IdParam} from '../../../../../types.ts';
import {useGetPublishedColouringPages} from '../../../../../queries/useGetPublishedColouringPages.ts';
import {useGetShopifyCollection} from '../../../../../queries/useGetShopifyCollection.ts';
import {interleaveShopProducts} from '../../../../../utilites/shopify.ts';
import {colouringTintClassName, ColouringAgeGroupOption, getColouringAgeGroups} from '../../../../../utilites/colouringPages.ts';
import {ShopProductCard} from './ShopProductCard.tsx';
import {GridItemViewer} from './GridItemViewer.tsx';
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
}

const AgeGroupPanel = ({ageGroup, organizerId}: AgeGroupPanelProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
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
            {gridItems.map((item, index) => item.type === 'product' ? (
                <ShopProductCard key={item.product.id} product={item.product} onOpen={() => setOpenIndex(index)}/>
            ) : (
                <div key={item.page.id} className={classes.colouringCard}>
                    <button
                        type="button"
                        className={`${classes.colouringTile} ${classes.tileButton} ${classes[colouringTintClassName(item.page.tint)]}`}
                        onClick={() => setOpenIndex(index)}
                        aria-label={item.page.title}
                        data-testid="colouring-page-open-button"
                    >
                        <img
                            src={item.page.thumbnail_url}
                            alt={item.page.title}
                            className={classes.colouringThumbnail}
                            loading="lazy"
                        />
                    </button>
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

            <GridItemViewer
                items={gridItems}
                index={openIndex}
                onIndexChange={setOpenIndex}
                onClose={() => setOpenIndex(null)}
            />
        </div>
    );
};

export const ColouringPagesTab = ({organizerId}: ColouringPagesTabProps) => {
    const [activeAgeGroup, setActiveAgeGroup] = useState<string | null>(DEFAULT_AGE_GROUP);
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
                        <AgeGroupPanel ageGroup={ageGroup} organizerId={organizerId}/>
                    </Tabs.Panel>
                ))}
            </Tabs>
        </div>
    );
};

export default ColouringPagesTab;
