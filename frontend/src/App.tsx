import React, {FC, PropsWithChildren, useEffect} from "react";
import {MantineProvider, v8CssVariablesResolver} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import {i18n} from "@lingui/core";
import {I18nProvider} from "@lingui/react";
import {ModalsProvider} from "@mantine/modals";
import {DatesProvider} from "@mantine/dates";
import {DehydratedState, HydrationBoundary, QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Helmet, HelmetProvider} from "react-helmet-async";
import type {ThemeColors} from "./utilites/themeColors.ts";

import "@mantine/core/styles/global.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/dropzone/styles.css";
import '@mantine/dates/styles.css';
import "@mantine/charts/styles.css";
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/outfit/latin-600.css";
import "@fontsource/outfit/latin-700.css";
import "@fontsource/outfit/latin-800.css";
import "@fontsource/plus-jakarta-sans/latin-400.css";
import "@fontsource/plus-jakarta-sans/latin-500.css";
import "@fontsource/plus-jakarta-sans/latin-600.css";
import "@fontsource/plus-jakarta-sans/latin-700.css";
import "@fontsource/plus-jakarta-sans/latin-800.css";
import "@fontsource/playfair-display/latin-400.css";
import "@fontsource/playfair-display/latin-500.css";
import "@fontsource/playfair-display/latin-600.css";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-800.css";
import "@fontsource/dancing-script/latin-600.css";
import "./styles/global.scss";
import {isSsr} from "./utilites/helpers.ts";
import {StartupChecks} from "./StartupChecks.tsx";
import {ThirdPartyScripts} from "./components/common/ThirdPartyScripts";
import {getConfig} from "./utilites/config.ts";
import {defaultShareImageUrl} from "./utilites/urlHelper.ts";
import {CookieConsentBanner} from "./components/common/CookieConsentBanner";
import {isConsentBannerEnabled} from "./utilites/cookieConsent";

declare global {
    interface Window {
        hievents: Record<string, string>;
    }
}

export const App: FC<
    PropsWithChildren<{
        queryClient: QueryClient;
        locale: string;
        themeColors: ThemeColors;
        helmetContext?: any;
        dehydratedState?: DehydratedState;
    }>
> = (props) => {
    const [isLoadedOnBrowser, setIsLoadedOnBrowser] = React.useState(false);
    useEffect(() => {
        setIsLoadedOnBrowser(!isSsr());
    }, []);

    return (
        <React.StrictMode>
            <div
                className="ssr-loader"
                style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    margin: 0,
                    padding: 0,
                    width: "100vw",
                    height: "100vh",
                    position: "fixed",
                    background: "#ffffff",
                    zIndex: 1000,
                    display: isLoadedOnBrowser ? "none" : "block",
                }}
            />
            <MantineProvider
                cssVariablesResolver={v8CssVariablesResolver}
                defaultColorScheme="light"
                theme={{
                    colors: props.themeColors,
                    primaryColor: "primary",
                    fontFamily: "Outfit, sans-serif",
                    primaryShade: 8,
                    defaultRadius: "sm",
                }}
            >
                <HelmetProvider context={props.helmetContext}>
                    <I18nProvider i18n={i18n}>
                        <DatesProvider settings={{locale: props.locale}}>
                        <QueryClientProvider client={props.queryClient}>
                            <HydrationBoundary state={props.dehydratedState}>
                                <StartupChecks/>
                                <ThirdPartyScripts/>
                                <ModalsProvider>
                                    <Helmet>
                                        <title>{getConfig("VITE_APP_NAME", "Hi.Events")}</title>
                                        <link rel="icon"
                                              type="image/svg+xml"
                                              href={getConfig("VITE_APP_FAVICON", "/manifest-icons/favicon.svg")}
                                        />
                                        <meta property="og:image" content={defaultShareImageUrl()}/>
                                        <meta name="twitter:image" content={defaultShareImageUrl()}/>
                                        <meta name="twitter:card" content="summary"/>
                                    </Helmet>
                                    {props.children}
                                </ModalsProvider>
                                <Notifications pauseResetOnHover="notification"/>
                                {isConsentBannerEnabled() && <CookieConsentBanner/>}
                            </HydrationBoundary>
                        </QueryClientProvider>
                        </DatesProvider>
                    </I18nProvider>
                </HelmetProvider>
            </MantineProvider>
        </React.StrictMode>
    );
};
