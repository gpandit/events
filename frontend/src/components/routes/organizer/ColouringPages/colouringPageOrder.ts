import {ColouringPage} from "../../../../types.ts";

export const moveWithinAgeGroup = (pages: ColouringPage[], pageId: number, direction: -1 | 1): number[] | null => {
    const page = pages.find((candidate) => candidate.id === pageId);
    if (!page) {
        return null;
    }

    const group = pages.filter((candidate) => candidate.age_group === page.age_group);
    const neighbour = group[group.findIndex((candidate) => candidate.id === pageId) + direction];
    if (!neighbour) {
        return null;
    }

    const ids = pages.map((candidate) => candidate.id);
    const from = ids.indexOf(pageId);
    const to = ids.indexOf(neighbour.id);
    [ids[from], ids[to]] = [ids[to], ids[from]];

    return ids;
};
