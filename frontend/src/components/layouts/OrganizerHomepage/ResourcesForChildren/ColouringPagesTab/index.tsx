import {IconDownload, IconExternalLink} from '@tabler/icons-react';
import {t} from '@lingui/macro';
import {colouringPages} from '../colouringPagesData.ts';
import classes from '../ResourcesForChildren.module.scss';

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

export const ColouringPagesTab = () => (
    <div className={classes.tabPanel}>
        {colouringPages.length > 0 ? (
            <div className={classes.colouringGrid}>
                {colouringPages.map((page) => (
                    <div key={page.title} className={classes.colouringCard}>
                        <div className={`${classes.colouringTile} ${classes[`tint-${page.tint}`]}`}>
                            <img
                                src={page.thumbnailUrl}
                                alt={page.title}
                                className={classes.colouringThumbnail}
                                loading="lazy"
                            />
                        </div>
                        <p className={classes.colouringTitle}>{page.title}</p>
                        <a href={page.pdfUrl} download className={classes.downloadLink}>
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
    </div>
);

export default ColouringPagesTab;
