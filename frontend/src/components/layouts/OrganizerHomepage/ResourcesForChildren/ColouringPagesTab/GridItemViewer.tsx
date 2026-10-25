import {useCallback, useEffect} from 'react';
import {ActionIcon, Modal} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconChevronLeft, IconChevronRight, IconDownload} from '@tabler/icons-react';
import {PublicColouringPage} from '../../../../../types.ts';
import {GridItem} from '../../../../../utilites/shopify.ts';
import {ShopProductDetails} from './ShopProductDetails.tsx';
import classes from '../ResourcesForChildren.module.scss';

const KEY_PREVIOUS = 'ArrowLeft';
const KEY_NEXT = 'ArrowRight';
const TYPING_TARGETS = 'input, textarea, select, [role="listbox"]';

interface GridItemViewerProps {
    items: GridItem<PublicColouringPage>[];
    index: number | null;
    onIndexChange: (index: number) => void;
    onClose: () => void;
}

export const GridItemViewer = ({items, index, onIndexChange, onClose}: GridItemViewerProps) => {
    const isOpen = index !== null && index < items.length;
    const item = isOpen ? items[index] : null;
    const total = items.length;

    const move = useCallback(
        (step: number) => onIndexChange(((index ?? 0) + step + total) % total),
        [index, total, onIndexChange]
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.target as HTMLElement | null)?.closest(TYPING_TARGETS)) {
                return;
            }
            if (event.key === KEY_PREVIOUS) {
                move(-1);
            } else if (event.key === KEY_NEXT) {
                move(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, move]);

    const position = (index ?? 0) + 1;
    const title = item?.type === 'product' ? item.product.title : item?.page.title;

    return (
        <Modal opened={isOpen} onClose={onClose} title={title} size="lg" centered>
            {item && (
                <div className={classes.viewer}>
                    <ActionIcon
                        variant="light"
                        size="lg"
                        radius="xl"
                        className={classes.viewerArrow}
                        onClick={() => move(-1)}
                        aria-label={t`Previous`}
                        data-testid="grid-viewer-previous"
                    >
                        <IconChevronLeft size={22}/>
                    </ActionIcon>

                    <div className={classes.viewerContent}>
                        {item.type === 'product' ? (
                            <ShopProductDetails key={item.product.id} product={item.product}/>
                        ) : (
                            <div className={classes.shopModalBody}>
                                <img
                                    src={item.page.thumbnail_url}
                                    alt={item.page.title}
                                    className={classes.viewerImage}
                                />
                                <a
                                    href={item.page.pdf_url}
                                    download
                                    target="_blank"
                                    className={`${classes.primaryButton} ${classes.viewerDownload}`}
                                    data-testid="colouring-page-download-button"
                                >
                                    <IconDownload size={18}/> {t`Download PDF`}
                                </a>
                            </div>
                        )}
                        <p className={classes.viewerCounter}>{t`${position} of ${total}`}</p>
                    </div>

                    <ActionIcon
                        variant="light"
                        size="lg"
                        radius="xl"
                        className={classes.viewerArrow}
                        onClick={() => move(1)}
                        aria-label={t`Next`}
                        data-testid="grid-viewer-next"
                    >
                        <IconChevronRight size={22}/>
                    </ActionIcon>
                </div>
            )}
        </Modal>
    );
};
