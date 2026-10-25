export class PdfThumbnailError extends Error {}

const THUMBNAIL_WIDTH = 600;

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

export const canvasToPngFile = async (canvas: HTMLCanvasElement, filename: string): Promise<File> => {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
        throw new PdfThumbnailError();
    }

    return new File([blob], filename, {type: 'image/png'});
};

export const renderPdfThumbnail = async (pdf: File): Promise<File> =>
    canvasToPngFile(await renderPdfFirstPage(pdf, THUMBNAIL_WIDTH), 'thumbnail.png');
