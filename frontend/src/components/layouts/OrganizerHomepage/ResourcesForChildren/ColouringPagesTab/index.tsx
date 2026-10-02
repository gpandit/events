import {IconDownload, IconExternalLink} from '@tabler/icons-react';
import {t} from '@lingui/macro';
import {colouringPages} from '../colouringPagesData.ts';
import classes from '../ResourcesForChildren.module.scss';

export const ColouringPagesTab = () => {
    return (
        <div className={classes.tabPanel}>
            {colouringPages.length > 0 ? (
                <div className={classes.carousel}>
                    {colouringPages.map((page) => (
                        <div key={page.title} className={classes.colouringCard}>
                            <img src={page.imageUrl} alt={page.title} className={classes.colouringImage}/>
                            <p className={classes.colouringTitle}>{page.title}</p>
                            <a href={page.pdfUrl} download className={classes.downloadLink}>
                                <IconDownload size={16}/> {t`Download PDF`}
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <p className={classes.comingSoon}>
                    {t`New colouring sheets are on their way — check back soon!`}
                </p>
            )}

            <a
                href="https://icreate.art"
                target="_blank"
                rel="noopener noreferrer"
                className={classes.shopLink}
            >
                {t`Love colouring? Shop creative colouring sets at icreate.art`} <IconExternalLink size={14}/>
            </a>
        </div>
    );
};

export default ColouringPagesTab;
