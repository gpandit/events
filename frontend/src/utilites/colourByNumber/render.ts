import {PaletteColour} from './colours.ts';
import {Region, toGrayscale} from './regions.ts';

const KEY_STRIP_SHARE = 0.14;
const KEY_STRIP_MIN_UNIT_SHARE = 0.17;
const ARTWORK_MARGIN = 0.03;
const CROP_THRESHOLD = 245;
const TEXT_COLOUR = 'rgb(60, 60, 60)';
const NUMBER_COLOUR = 'rgb(70, 70, 70)';
const FONT_WEIGHT = 'bold';
const FONT_SIZE_UNIT_AND_FAMILY = 'px sans-serif';
const RGB_OPEN = 'rgb(';
const RGB_CLOSE = ')';
const RGB_SEPARATOR = ',';
const PAGE_COLOUR = 'white';
const LIGHT_LABEL_COLOUR = 'white';
const DARK_LABEL_COLOUR = 'rgb(40, 40, 40)';

const boldFont = (size: number): string => `${FONT_WEIGHT} ${size}${FONT_SIZE_UNIT_AND_FAMILY}`;

const createCanvas = (width: number, height: number): HTMLCanvasElement => {
    const canvas = window.document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    return canvas;
};

const contextOf = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error();
    }

    return context;
};

const cloneCanvas = (source: HTMLCanvasElement): HTMLCanvasElement => {
    const canvas = createCanvas(source.width, source.height);
    contextOf(canvas).drawImage(source, 0, 0);

    return canvas;
};

export const drawNumbers = (source: HTMLCanvasElement, regions: Region[], assigned: Map<number, number>): HTMLCanvasElement => {
    const canvas = cloneCanvas(source);
    const context = contextOf(canvas);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = NUMBER_COLOUR;

    for (const region of regions) {
        const size = Math.round(Math.min(Math.max(region.radius * 1.15, 18), 44));
        context.font = boldFont(size);
        context.fillText(String((assigned.get(region.id) ?? 0) + 1), region.x, region.y);
    }

    return canvas;
};

export const drawAnswer = (
    source: HTMLCanvasElement,
    labels: Int32Array,
    assigned: Map<number, number>,
    palette: PaletteColour[]
): HTMLCanvasElement => {
    const canvas = cloneCanvas(source);
    const context = contextOf(canvas);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);

    const colourByLabel = new Int16Array(Math.max(...assigned.keys(), 0) + 1).fill(-1);
    assigned.forEach((colourIndex, label) => {
        colourByLabel[label] = colourIndex;
    });

    for (let index = 0; index < labels.length; index++) {
        const label = labels[index];
        const colourIndex = label < colourByLabel.length ? colourByLabel[label] : -1;
        if (colourIndex >= 0) {
            const [red, green, blue] = palette[colourIndex].rgb;
            image.data[index * 4] = red;
            image.data[index * 4 + 1] = green;
            image.data[index * 4 + 2] = blue;
        }
    }

    context.putImageData(image, 0, 0);

    return canvas;
};

const findContentBounds = (canvas: HTMLCanvasElement) => {
    const {width, height} = canvas;
    const gray = toGrayscale(contextOf(canvas).getImageData(0, 0, width, height).data);
    let left = width;
    let top = height;
    let right = 0;
    let bottom = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (gray[y * width + x] < CROP_THRESHOLD) {
                left = Math.min(left, x);
                right = Math.max(right, x);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
            }
        }
    }

    return {left, top, width: Math.max(right - left + 1, 1), height: Math.max(bottom - top + 1, 1)};
};

export const composeWithKey = (
    artwork: HTMLCanvasElement,
    usedColours: number[],
    palette: PaletteColour[],
    title: string
): HTMLCanvasElement => {
    const {width, height} = artwork;
    const canvas = createCanvas(width, height);
    const context = contextOf(canvas);
    context.fillStyle = PAGE_COLOUR;
    context.fillRect(0, 0, width, height);

    const unit = Math.min(width, height);
    const bounds = findContentBounds(artwork);
    const stripHeight = Math.max(height * KEY_STRIP_SHARE, unit * KEY_STRIP_MIN_UNIT_SHARE);
    const availableWidth = width * (1 - 2 * ARTWORK_MARGIN);
    const availableHeight = height - stripHeight - height * ARTWORK_MARGIN;
    const ratio = Math.min(availableWidth / bounds.width, availableHeight / bounds.height);
    const drawWidth = bounds.width * ratio;
    const drawHeight = bounds.height * ratio;

    context.imageSmoothingQuality = 'high';
    context.drawImage(artwork, bounds.left, bounds.top, bounds.width, bounds.height, (width - drawWidth) / 2, height * ARTWORK_MARGIN, drawWidth, drawHeight);

    const stripTop = height * ARTWORK_MARGIN + drawHeight + height * 0.015;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = TEXT_COLOUR;
    context.font = boldFont(Math.round(unit * 0.026));
    context.fillText(title, width / 2, stripTop + height * 0.012);

    const slot = (width * 0.88) / Math.max(usedColours.length, 1);
    const radius = Math.min(slot * 0.34, unit * 0.04);
    const left = (width - slot * usedColours.length) / 2;

    usedColours.forEach((colourIndex, position) => {
        const {name, rgb} = palette[colourIndex];
        const x = left + slot * (position + 0.5);
        const y = stripTop + height * 0.062;

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = RGB_OPEN + rgb.join(RGB_SEPARATOR) + RGB_CLOSE;
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = TEXT_COLOUR;
        context.stroke();

        const luminance = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
        context.fillStyle = luminance < 150 ? LIGHT_LABEL_COLOUR : DARK_LABEL_COLOUR;
        context.font = boldFont(Math.round(unit * 0.03));
        context.fillText(String(colourIndex + 1), x, y);

        context.fillStyle = TEXT_COLOUR;
        context.font = boldFont(Math.round(unit * 0.021));
        context.fillText(name, x, y + radius + height * 0.014);
    });

    return canvas;
};
