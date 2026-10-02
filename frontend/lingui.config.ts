import type {LinguiConfig} from "@lingui/conf";

const config: LinguiConfig = {
    locales: [
        "en", // English
        "ar", // Arabic
    ],
    catalogs: [
        {
            path: "<rootDir>/src/locales/{locale}",
            include: ["src"],
        },
    ],
    sourceLocale: "en",
    format: "po",
    fallbackLocales: {
       default: "en",
    }
};

export default config;
