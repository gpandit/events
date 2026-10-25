import {redirect} from "react-router";
import {Organizer} from "../types.ts";
import {isDefaultOrganizer, organizerBasePath} from "../utilites/urlHelper.ts";

const LEGACY_ORGANIZER_PATH = /^\/events\/[^/]+\/[^/]+(\/.*)?$/;
const LEGACY_ACCOUNT_SEGMENT = /^\/account(?=\/|$)/;

export const redirectToCanonicalOrganizerPath = (organizer: Organizer | null | undefined, requestUrl: string) => {
    if (!organizer?.slug) {
        return;
    }

    const url = new URL(requestUrl);
    const legacyMatch = url.pathname.match(LEGACY_ORGANIZER_PATH);

    if (!legacyMatch) {
        return;
    }

    const suffix = isDefaultOrganizer(organizer.id)
        ? (legacyMatch[1] ?? '').replace(LEGACY_ACCOUNT_SEGMENT, '/my-account')
        : legacyMatch[1] ?? '';
    const canonicalPath = `${organizerBasePath(organizer)}${suffix}` || '/';

    if (canonicalPath !== url.pathname) {
        throw redirect(`${canonicalPath}${url.search}`, 301);
    }
};
