import {useRef} from 'react';
import {IconChevronLeft, IconChevronRight, IconDownload, IconExternalLink} from '@tabler/icons-react';
import {t} from '@lingui/macro';
import {colouringPages} from '../colouringPagesData.ts';
import classes from '../ResourcesForChildren.module.scss';

export const ColouringPagesTab = () => {
    const trackRef = useRef<HTMLDivElement>(null);

    const scrollByCard = (direction: 1 | -1) => {
        const track = trackRef.current;
        if (!track) {
            return;
        }
        const card = track.querySelector<HTMLElement>(`.${classes.colouringCard}`);
        const step = (card?.offsetWidth ?? 260) + 16;
        track.scrollBy({left: step * direction, behavior: 'smooth'});
    };

    return (
        <div className={classes.tabPanel}>
            {colouringPages.length > 0 ? (
                <div className={classes.carouselWrapper}>
                    <button
                        type="button"
                        className={classes.carouselNav}
                        onClick={() => scrollByCard(-1)}
                        aria-label={t`Scroll to previous colouring page`}
                    >
                        <IconChevronLeft size={18}/>
                    </button>

                    <div className={classes.carousel} ref={trackRef}>
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
                    </div>

                    <button
                        type="button"
                        className={classes.carouselNav}
                        onClick={() => scrollByCard(1)}
                        aria-label={t`Scroll to next colouring page`}
                    >
                        <IconChevronRight size={18}/>
                    </button>
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
                {t`Love colouring? Shop creative colouring sets at`}{' '}
                <img src="/logos/icreate-logo.webp" alt={t`I Create`} className={classes.shopLinkLogo}/>
                <IconExternalLink size={16}/>
            </a>
        </div>
    );
};

export default ColouringPagesTab;
