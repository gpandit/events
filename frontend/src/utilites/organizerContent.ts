import {Organizer} from "../types.ts";
import {getConfig} from "./config.ts";
import {validateThemeSettings} from "./themeUtils.ts";

export const getOrganizerInstagramHandle = (organizer: Organizer): string => {
    const theme = validateThemeSettings(organizer.settings?.homepage_theme_settings);
    return theme.instagram_handle || getConfig('VITE_INSTAGRAM_HANDLE') || '';
}

export const getOrganizerContactEmail = (organizer: Organizer): string => {
    const theme = validateThemeSettings(organizer.settings?.homepage_theme_settings);
    return theme.contact_email || organizer.email;
}
