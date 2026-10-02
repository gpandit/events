import React from "react";
import {useComputedColorScheme} from "@mantine/core";
import {Organizer} from "../types.ts";
import {computeThemeVariables, validateThemeSettings} from "../utilites/themeUtils.ts";

export const useOrganizerThemeStyles = (organizer?: Organizer | null) => {
    const computedColorScheme = useComputedColorScheme('light');

    const rawThemeSettings = organizer?.settings?.homepage_theme_settings;
    const organizerThemeSettings = validateThemeSettings(rawThemeSettings);
    const themeSettings = {...organizerThemeSettings, mode: computedColorScheme};
    const cssVars = computeThemeVariables(themeSettings);

    const themeStyles = {
        '--organizer-bg-color': themeSettings.background,
        '--organizer-content-bg-color': cssVars['--theme-surface'],
        '--organizer-primary-color': themeSettings.accent,
        '--organizer-primary-text-color': cssVars['--theme-text-primary'],
        '--organizer-secondary-color': cssVars['--theme-text-secondary'],
        '--organizer-secondary-text-color': cssVars['--theme-text-tertiary'],
        '--organizer-accent-contrast': cssVars['--theme-accent-contrast'],
        '--organizer-accent-text': cssVars['--theme-accent-text'],
        '--organizer-accent-soft': cssVars['--theme-accent-soft'],
        '--organizer-accent-muted': cssVars['--theme-accent-muted'],
        '--organizer-border-color': cssVars['--theme-border'],
        '--theme-font-family': cssVars['--theme-font-family'],
        fontFamily: cssVars['--theme-font-family'],
    } as React.CSSProperties;

    return {themeSettings, cssVars, themeStyles, mode: themeSettings.mode};
};
