import {t} from '@lingui/macro';
import {Region} from './regions.ts';

const MAX_ADJACENCY_GAP = 16;

export interface PaletteColour {
    name: string;
    rgb: [number, number, number];
}

export const getPalette = (): PaletteColour[] => [
    {name: t`Red`, rgb: [230, 57, 70]},
    {name: t`Orange`, rgb: [244, 162, 97]},
    {name: t`Yellow`, rgb: [249, 217, 73]},
    {name: t`Lime`, rgb: [167, 214, 118]},
    {name: t`Green`, rgb: [59, 165, 93]},
    {name: t`Sky`, rgb: [122, 199, 232]},
    {name: t`Blue`, rgb: [58, 110, 165]},
    {name: t`Purple`, rgb: [155, 107, 201]},
    {name: t`Pink`, rgb: [242, 138, 178]},
];

const findNeighbours = (labels: Int32Array, width: number, height: number, regions: Region[]): Map<number, Set<number>> => {
    const compact = new Int32Array(Math.max(...regions.map((region) => region.id), 0) + 1).fill(-1);
    regions.forEach((region, index) => {
        compact[region.id] = index;
    });

    const masked = new Int32Array(labels.length);
    for (let index = 0; index < labels.length; index++) {
        const label = labels[index];
        masked[index] = label < compact.length ? compact[label] : -1;
    }

    const stride = regions.length + 1;
    const pairs = new Set<number>();
    const note = (first: number, second: number) => {
        if (first >= 0 && second >= 0 && first !== second) {
            pairs.add(Math.min(first, second) * stride + Math.max(first, second));
        }
    };

    for (let gap = 2; gap <= MAX_ADJACENCY_GAP; gap++) {
        for (let y = 0; y < height; y++) {
            const row = y * width;
            for (let x = 0; x < width - gap; x++) {
                note(masked[row + x], masked[row + x + gap]);
            }
        }
        for (let y = 0; y < height - gap; y++) {
            const row = y * width;
            for (let x = 0; x < width; x++) {
                note(masked[row + x], masked[row + gap * width + x]);
            }
        }
    }

    const neighbours = new Map<number, Set<number>>(regions.map((region) => [region.id, new Set<number>()]));
    pairs.forEach((pair) => {
        const first = regions[Math.floor(pair / stride)].id;
        const second = regions[pair % stride].id;
        neighbours.get(first)?.add(second);
        neighbours.get(second)?.add(first);
    });

    return neighbours;
};

export const assignColours = (
    labels: Int32Array,
    width: number,
    height: number,
    regions: Region[],
    paletteSize: number
): Map<number, number> => {
    const neighbours = findNeighbours(labels, width, height, regions);
    const assigned = new Map<number, number>();
    const order = [...regions].sort((a, b) => (neighbours.get(b.id)?.size ?? 0) - (neighbours.get(a.id)?.size ?? 0));

    for (const region of order) {
        const position = (0.65 * region.y / height + 0.35 * region.x / width) % 1;
        const preferred = position * (paletteSize - 1);
        const taken = new Set([...(neighbours.get(region.id) ?? [])].map((other) => assigned.get(other)));
        const candidates = Array.from({length: paletteSize}, (_, index) => index)
            .sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));
        assigned.set(region.id, candidates.find((index) => !taken.has(index)) ?? candidates[0]);
    }

    return assigned;
};
