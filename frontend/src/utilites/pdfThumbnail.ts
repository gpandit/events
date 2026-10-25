export class PdfThumbnailError extends Error {}

const THUMBNAIL_WIDTH = 600;
const THUMBNAIL_TARGET_BYTES = 150 * 1024;
const THUMBNAIL_QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4];
const THUMBNAIL_SHRINK_FACTOR = 0.75;
const THUMBNAIL_MIN_WIDTH = 240;

export const renderPdfFirstPage = async (pdf: File, width: number): Promise<HTMLCanvasElement> => {
    const pdfjs = await import('pdfjs-dist');
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

    const document = await pdfjs.getDocument({data: await pdf.arrayBuffer()}).promise;
    const page = await document.getPage(1);
    const baseViewport = page.getViewport({scale: 1});
    const viewport = page.getViewport({scale: width / baseViewport.width});

    const canvas = window.document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) {
        throw new PdfThumbnailError();
    }

    await page.render({canvasContext, viewport}).promise;

    return canvas;
};

export const scaleCanvasToWidth = (source: HTMLCanvasElement, width: number): HTMLCanvasElement => {
    const canvas = window.document.createElement('canvas');
    canvas.width = width;
    canvas.height = Math.round(source.height * (width / source.width));
    const context = canvas.getContext('2d');
    if (!context) {
        throw new PdfThumbnailError();
    }
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    return canvas;
};

const canvasToBlob = async (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    if (!blob) {
        throw new PdfThumbnailError();
    }

    return blob;
};

export const canvasToThumbnailFile = async (canvas: HTMLCanvasElement, name: string): Promise<File> => {
    let current = canvas;

    for (;;) {
        let smallest: Blob | null = null;
        for (const quality of THUMBNAIL_QUALITY_STEPS) {
            const blob = await canvasToBlob(current, quality);
            if (smallest === null || blob.size < smallest.size) {
                smallest = blob;
            }
            if (blob.size <= THUMBNAIL_TARGET_BYTES) {
                break;
            }
        }

        const nextWidth = Math.floor(current.width * THUMBNAIL_SHRINK_FACTOR);
        if (smallest !== null && (smallest.size <= THUMBNAIL_TARGET_BYTES || nextWidth < THUMBNAIL_MIN_WIDTH)) {
            const extension = smallest.type === 'image/webp' ? 'webp' : 'png';

            return new File([smallest], `${name}.${extension}`, {type: smallest.type});
        }

        current = scaleCanvasToWidth(current, nextWidth);
    }
};

export const renderPdfThumbnail = async (pdf: File): Promise<File> =>
    canvasToThumbnailFile(await renderPdfFirstPage(pdf, THUMBNAIL_WIDTH), 'thumbnail');
