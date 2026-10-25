const LINE_THRESHOLD = 170;
const MIN_INSCRIBED_RADIUS = 12;
const BACKGROUND_AREA_SHARE = 0.22;
const FOOTER_START = 0.93;
const FAR = 1e20;

export interface Region {
    id: number;
    x: number;
    y: number;
    radius: number;
}

export interface RegionAnalysis {
    labels: Int32Array;
    regions: Region[];
}

export const toGrayscale = (rgba: Uint8ClampedArray): Uint8Array => {
    const gray = new Uint8Array(rgba.length / 4);
    for (let index = 0; index < gray.length; index++) {
        gray[index] = 0.299 * rgba[index * 4] + 0.587 * rgba[index * 4 + 1] + 0.114 * rgba[index * 4 + 2];
    }

    return gray;
};

export const isLinePixel = (gray: number): boolean => gray < LINE_THRESHOLD;

interface Labelling {
    labels: Int32Array;
    sizes: number[];
    touchesBorder: boolean[];
}

const labelRegions = (isLine: Uint8Array, width: number, height: number): Labelling => {
    const labels = new Int32Array(width * height);
    const stack = new Int32Array(width * height);
    const sizes = [0];
    const touchesBorder = [false];

    for (let start = 0; start < labels.length; start++) {
        if (isLine[start] || labels[start]) {
            continue;
        }

        const label = sizes.length;
        let size = 0;
        let touches = false;
        let top = 0;
        stack[top++] = start;
        labels[start] = label;

        while (top > 0) {
            const index = stack[--top];
            const x = index % width;
            const y = (index - x) / width;
            size++;
            if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                touches = true;
            }

            const neighbours = [
                x > 0 ? index - 1 : -1,
                x < width - 1 ? index + 1 : -1,
                y > 0 ? index - width : -1,
                y < height - 1 ? index + width : -1,
            ];
            for (const neighbour of neighbours) {
                if (neighbour >= 0 && !isLine[neighbour] && !labels[neighbour]) {
                    labels[neighbour] = label;
                    stack[top++] = neighbour;
                }
            }
        }

        sizes.push(size);
        touchesBorder.push(touches);
    }

    return {labels, sizes, touchesBorder};
};

const squaredDistanceTransform1d = (f: Float64Array, length: number, out: Float64Array, v: Int32Array, z: Float64Array) => {
    let k = 0;
    v[0] = 0;
    z[0] = -FAR;
    z[1] = FAR;

    for (let q = 1; q < length; q++) {
        let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) {
            k--;
            s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        }
        k++;
        v[k] = q;
        z[k] = s;
        z[k + 1] = FAR;
    }

    k = 0;
    for (let q = 0; q < length; q++) {
        while (z[k + 1] < q) {
            k++;
        }
        out[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
};

const squaredDistanceToLines = (isLine: Uint8Array, width: number, height: number): Float32Array => {
    const size = Math.max(width, height);
    const f = new Float64Array(size);
    const out = new Float64Array(size);
    const v = new Int32Array(size);
    const z = new Float64Array(size + 1);
    const distance = new Float32Array(width * height);

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            f[y] = isLine[y * width + x] ? 0 : FAR;
        }
        squaredDistanceTransform1d(f, height, out, v, z);
        for (let y = 0; y < height; y++) {
            distance[y * width + x] = out[y];
        }
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            f[x] = distance[y * width + x];
        }
        squaredDistanceTransform1d(f, width, out, v, z);
        for (let x = 0; x < width; x++) {
            distance[y * width + x] = out[x];
        }
    }

    return distance;
};

export const findRegions = (gray: Uint8Array, width: number, height: number): RegionAnalysis => {
    const isLine = new Uint8Array(gray.length);
    for (let index = 0; index < gray.length; index++) {
        isLine[index] = isLinePixel(gray[index]) ? 1 : 0;
    }

    const {labels, sizes, touchesBorder} = labelRegions(isLine, width, height);
    const distance = squaredDistanceToLines(isLine, width, height);

    const bestDistance = new Float32Array(sizes.length);
    const bestIndex = new Int32Array(sizes.length);
    for (let index = 0; index < labels.length; index++) {
        const label = labels[index];
        if (label && distance[index] > bestDistance[label]) {
            bestDistance[label] = distance[index];
            bestIndex[label] = index;
        }
    }

    const pageArea = width * height;
    const regions: Region[] = [];
    for (let label = 1; label < sizes.length; label++) {
        const radius = Math.sqrt(bestDistance[label]);
        const x = bestIndex[label] % width;
        const y = Math.floor(bestIndex[label] / width);
        const isBackground = touchesBorder[label] || sizes[label] > BACKGROUND_AREA_SHARE * pageArea;
        if (isBackground || radius < MIN_INSCRIBED_RADIUS || y > FOOTER_START * height) {
            continue;
        }
        regions.push({id: label, x, y, radius});
    }

    return {labels, regions};
};
