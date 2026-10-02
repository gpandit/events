import {Select} from "@mantine/core";
import {dynamicActivateLocale, getClientLocale, localeToNameMap, SupportedLocales} from "../../../locales.ts";
import {t} from "@lingui/macro";
import {IconWorld} from "@tabler/icons-react";
import {useLingui} from "@lingui/react";

export const LanguageSwitcher = () => {
    useLingui();

    // Ideally these would be in the locales.ts file, but when they're there they don't translate
    const getLocaleName = (locale: SupportedLocales): string => {
        switch (locale) {
            case "en":
                return t`English`;
            case "ar":
                return t`Arabic`;
            default:
                // Defensive fallback: if a new locale is added to SupportedLocales
                // but not handled here, return the locale code itself rather than
                // undefined. An undefined label propagates into Mantine's Combobox
                // `defaultOptionsFilter`, which calls `.toLowerCase()` on it and
                // throws during SSR, 500-ing every auth page.
                return locale;
        }
    };

    return (
        <>
            <Select
                leftSection={<IconWorld size={15} color={'#ccc'}/>}
                width={180}
                size={'xs'}
                required
                data={Object.keys(localeToNameMap).map(locale => ({
                    value: locale,
                    label: getLocaleName(locale as SupportedLocales),
                }))}
                defaultValue={getClientLocale()}
                placeholder={t`English`}
                onChange={(value) => {
                    if (!value) return;
                    document.cookie = `locale=${value};path=/;max-age=31536000`;
                    dynamicActivateLocale(value).finally(() => {
                        window.location.href = window.location.pathname + window.location.search;
                    });
                }}
            />
        </>
    )
}
