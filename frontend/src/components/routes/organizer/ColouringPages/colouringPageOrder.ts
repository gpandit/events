import {ColouringPage} from "../../../../types.ts";

export const moveWithinAgeGroup = (pages: ColouringPage[], pageId: number, direction: -1 | 1): number[] | null => {
    const page = pages.find((candidate) => candidate.id === pageId);
    if (!page) {
        return null;
    }

    const groupIds = pages
        .filter((candidate) => candidate.age_group === page.age_group)
        .map((candidate) => candidate.id);
    const from = groupIds.indexOf(pageId);
    const to = from + direction;
    if (to < 0 || to >= groupIds.length) {
        return null;
    }

    [groupIds[from], groupIds[to]] = [groupIds[to], groupIds[from]];

    return groupIds;
};
