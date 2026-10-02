import {useEffect, useRef, useState} from 'react';
import {ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme} from '@mantine/core';
import {IconAdjustments, IconArrowUp, IconLanguage, IconMoon, IconSun, IconTextSize} from '@tabler/icons-react';
import {t} from '@lingui/macro';
import {dynamicActivateLocale, getClientLocale, SupportedLocales} from '../../../locales.ts';
import classes from './FloatingSiteControls.module.scss';

const TEXT_SCALE_STORAGE_KEY = 'fos_text_scale';
const TEXT_SCALES = [1, 1.125, 1.25];
const SCROLL_TOP_THRESHOLD = 400;

const getStoredTextScale = (): number => {
    if (typeof window === 'undefined') {
        return 1;
    }

    const stored = Number(window.localStorage.getItem(TEXT_SCALE_STORAGE_KEY));
    return TEXT_SCALES.includes(stored) ? stored : 1;
};

export const FloatingSiteControls = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [textScale, setTextScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const {setColorScheme} = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light');

    useEffect(() => {
        const initialScale = getStoredTextScale();
        setTextScale(initialScale);
        document.documentElement.style.fontSize = `${16 * initialScale}px`;

        return () => {
            document.documentElement.style.fontSize = '';
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_TOP_THRESHOLD);
        handleScroll();
        window.addEventListener('scroll', handleScroll, {passive: true});
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsOpen(false);
        }
    };

    const handleThemeToggle = () => {
        setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
        setIsOpen(false);
    };

    const handleLanguageToggle = () => {
        const currentLocale = getClientLocale() as SupportedLocales;
        const nextLocale: SupportedLocales = currentLocale === 'ar' ? 'en' : 'ar';
        document.cookie = `locale=${nextLocale};path=/;max-age=31536000`;
        dynamicActivateLocale(nextLocale).finally(() => {
            window.location.href = window.location.pathname + window.location.search;
        });
        setIsOpen(false);
    };

    const handleTextSizeToggle = () => {
        const currentIndex = TEXT_SCALES.indexOf(textScale);
        const nextScale = TEXT_SCALES[(currentIndex + 1) % TEXT_SCALES.length];
        setTextScale(nextScale);
        document.documentElement.style.fontSize = `${16 * nextScale}px`;
        window.localStorage.setItem(TEXT_SCALE_STORAGE_KEY, String(nextScale));
        setIsOpen(false);
    };

    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    return (
        <div
            ref={containerRef}
            className={classes.wrapper}
            onBlur={handleBlur}
        >
            <Tooltip label={t`Back to top`} position="left">
                <ActionIcon
                    onClick={scrollToTop}
                    variant="filled"
                    size={40}
                    radius="xl"
                    className={`${classes.scrollTop} ${(isScrolled && !isOpen) ? classes.scrollTopVisible : ''}`}
                    aria-label={t`Back to top`}
                    tabIndex={(isScrolled && !isOpen) ? 0 : -1}
                >
                    <IconArrowUp size={18}/>
                </ActionIcon>
            </Tooltip>

            <div className={`${classes.satellite} ${isOpen ? classes.satelliteOpen : ''}`}>
                <Tooltip label={t`Toggle light and dark theme`} position="left">
                    <ActionIcon
                        onClick={handleThemeToggle}
                        variant="filled"
                        size={48}
                        radius="xl"
                        className={classes.satelliteButton}
                        aria-label={t`Toggle light and dark theme`}
                        tabIndex={isOpen ? 0 : -1}
                    >
                        {computedColorScheme === 'dark' ? <IconSun size={20}/> : <IconMoon size={20}/>}
                    </ActionIcon>
                </Tooltip>

                <Tooltip label={t`Switch language`} position="left">
                    <ActionIcon
                        onClick={handleLanguageToggle}
                        variant="filled"
                        size={48}
                        radius="xl"
                        className={classes.satelliteButton}
                        aria-label={t`Switch language`}
                        tabIndex={isOpen ? 0 : -1}
                    >
                        <IconLanguage size={20}/>
                    </ActionIcon>
                </Tooltip>

                <Tooltip label={t`Change text size`} position="left">
                    <ActionIcon
                        onClick={handleTextSizeToggle}
                        variant="filled"
                        size={48}
                        radius="xl"
                        className={classes.satelliteButton}
                        aria-label={t`Change text size`}
                        tabIndex={isOpen ? 0 : -1}
                    >
                        <IconTextSize size={20}/>
                    </ActionIcon>
                </Tooltip>
            </div>

            <ActionIcon
                onClick={() => setIsOpen((open) => !open)}
                variant="filled"
                size={48}
                radius="xl"
                className={classes.toggle}
                aria-label={t`Display options`}
                aria-expanded={isOpen}
                title={t`Display options`}
            >
                <IconAdjustments size={22}/>
            </ActionIcon>
        </div>
    );
};

export default FloatingSiteControls;
