import {redirect} from "react-router";
import {Organizer} from "../types.ts";
import {organizerBasePath} from "../utilites/urlHelper.ts";

const LEGACY_ORGANIZER_PATH = /^\/events\/[^/]+\/[^/]+(\/.*)?$/;

export const redirectToCanonicalOrganizerPath = (organizer: Organizer | null | undefined, requestUrl: string) => {
    if (!organizer?.slug) {
        return;
    }

    const url = new URL(requestUrl);
    const legacyMatch = url.pathname.match(LEGACY_ORGANIZER_PATH);

    if (!legacyMatch) {
        return;
    }

    const canonicalPath = `${organizerBasePath(organizer)}${legacyMatch[1] ?? ''}` || '/';

    if (canonicalPath !== url.pathname) {
        throw redirect(`${canonicalPath}${url.search}`, 301);
    }
};
