import {t} from '@lingui/macro';
import {canvasToPngFile, renderPdfFirstPage} from '../pdfThumbnail.ts';
import {assignColours, getPalette} from './colours.ts';
import {findRegions, toGrayscale} from './regions.ts';
import {composeWithKey, drawAnswer, drawNumbers} from './render.ts';

const RENDER_WIDTH = 1700;
const RENDER_DPI = 200;
const PREVIEW_WIDTH = 600;
const POINTS_PER_INCH = 72;

export class ColourByNumberError extends Error {}

export interface ColourByNumber {
    pdf: File;
    thumbnail: File;
    previewUrl: string;
}

const scaleToWidth = (source: HTMLCanvasElement, width: number): HTMLCanvasElement => {
    const canvas = window.document.createElement('canvas');
    canvas.width = width;
    canvas.height = Math.round(source.height * (width / source.width));
    const context = canvas.getContext('2d');
    if (!context) {
        throw new ColourByNumberError();
    }
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    return canvas;
};

export const createColourByNumber = async (source: File): Promise<ColourByNumber> => {
    const page = await renderPdfFirstPage(source, RENDER_WIDTH);
    const {width, height} = page;
    const context = page.getContext('2d');
    if (!context) {
        throw new ColourByNumberError();
    }

    const gray = toGrayscale(context.getImageData(0, 0, width, height).data);
    const {labels, regions} = findRegions(gray, width, height);
    if (regions.length === 0) {
        throw new ColourByNumberError();
    }

    const palette = getPalette();
    const assigned = assignColours(labels, width, height, regions, palette.length);
    const usedColours = [...new Set(assigned.values())].sort((a, b) => a - b);

    const numbered = composeWithKey(drawNumbers(page, regions, assigned), usedColours, palette, t`Colour by number: match each number to its colour`);
    const answer = composeWithKey(drawAnswer(page, labels, assigned, palette), usedColours, palette, t`Finished picture`);

    const {jsPDF} = await import('jspdf');
    const pageWidth = (width * POINTS_PER_INCH) / RENDER_DPI;
    const pageHeight = (height * POINTS_PER_INCH) / RENDER_DPI;
    const document = new jsPDF({unit: 'pt', format: [pageWidth, pageHeight], orientation: pageWidth > pageHeight ? 'landscape' : 'portrait'});
    document.addImage(numbered, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    document.addPage([pageWidth, pageHeight], pageWidth > pageHeight ? 'landscape' : 'portrait');
    document.addImage(answer, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

    const baseName = source.name.replace(/\.pdf$/i, '');
    const preview = scaleToWidth(numbered, PREVIEW_WIDTH);

    return {
        pdf: new File([document.output('blob')], `${baseName}-colour-by-number.pdf`, {type: 'application/pdf'}),
        thumbnail: await canvasToPngFile(preview, 'thumbnail.png'),
        previewUrl: preview.toDataURL('image/png'),
    };
};
