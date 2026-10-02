import {i18n} from "@lingui/core";

export type SupportedLocales = "en" | "ar";

export const availableLocales = ["en", "ar"];

export const localeToFlagEmojiMap: Record<SupportedLocales, string> = {
    en: '🇬🇧',
    ar: '🇦🇪',
};

export const localeToNameMap: Record<SupportedLocales, string> = {
    en: `English`,
    ar: `Arabic`,
};

export const getLocaleName = (locale: SupportedLocales) => {
    return localeToNameMap[locale];
}

export const getClientLocale = () => {
    if (typeof window !== "undefined") {
        const storedLocale = document
            .cookie
            .split(";")
            .find((c) => c.includes("locale="))
            ?.split("=")[1];

        if (storedLocale) {
            return getSupportedLocale(storedLocale);
        }

        return getSupportedLocale(window.navigator.language);
    }

    return "en";
};

const dayjsLocaleLoaders: Partial<Record<SupportedLocales, () => Promise<unknown>>> = {
    ar: () => import("dayjs/locale/ar"),
};

export async function dynamicActivateLocale(locale: string) {
    try {
        locale = availableLocales.includes(locale) ? locale : "en";
        const [module] = await Promise.all([
            import(`./locales/${locale}.po`),
            dayjsLocaleLoaders[locale as SupportedLocales]?.().catch((error) => console.error("Error loading dayjs locale:", error)),
        ]);
        i18n.load(locale, module.messages);
        i18n.activate(locale);
    } catch (error) {
        console.error("Error loading locale:", error);
        // i18n.activate("en");
    }
}

export const getSupportedLocale = (userLocale: string) => {
    const normalizedLocale = userLocale.toLowerCase();

    if (availableLocales.includes(normalizedLocale)) {
        return normalizedLocale;
    }

    const mainLanguage = normalizedLocale.split('-')[0];
    const mainLocale = availableLocales.find(locale => locale.startsWith(mainLanguage));
    if (mainLocale) {
        return mainLocale;
    }

    return "en";
};
