const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const PHOTO_WIDTH = 480;
const PHOTO_TIMEOUT_MS = 5000;

const photoCache = new Map<string, string>();

interface TitleAlias {
    from: string;
    to: string;
}

interface WikipediaThumbnailResponse {
    query?: {
        normalized?: TitleAlias[];
        redirects?: TitleAlias[];
        pages?: { title: string; thumbnail?: { source: string } }[];
    };
}

const fetchThumbnailUrls = async (titles: string[]): Promise<Map<string, string>> => {
    const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        formatversion: '2',
        origin: '*',
        redirects: '1',
        prop: 'pageimages',
        piprop: 'thumbnail',
        pithumbsize: String(PHOTO_WIDTH),
        titles: titles.join('|'),
    });
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), PHOTO_TIMEOUT_MS);

    try {
        const response = await fetch(`${WIKIPEDIA_API}?${params}`, {signal: controller.signal, referrerPolicy: 'no-referrer'});
        const {query} = await response.json() as WikipediaThumbnailResponse;
        const normalized = new Map((query?.normalized ?? []).map(({from, to}) => [from, to]));
        const redirected = new Map((query?.redirects ?? []).map(({from, to}) => [from, to]));
        const thumbnails = new Map((query?.pages ?? []).map((page) => [page.title, page.thumbnail?.source]));

        const urls = new Map<string, string>();
        titles.forEach((title) => {
            const normalizedTitle = normalized.get(title) ?? title;
            const thumbnail = thumbnails.get(redirected.get(normalizedTitle) ?? normalizedTitle);
            if (thumbnail) {
                urls.set(title, thumbnail);
            }
        });
        return urls;
    } catch {
        return new Map();
    } finally {
        window.clearTimeout(timer);
    }
};

const canLoadImage = (url: string): Promise<boolean> => new Promise((resolve) => {
    const image = new Image();
    const timer = window.setTimeout(() => resolve(false), PHOTO_TIMEOUT_MS);
    image.referrerPolicy = 'no-referrer';
    image.onload = () => {
        window.clearTimeout(timer);
        resolve(true);
    };
    image.onerror = () => {
        window.clearTimeout(timer);
        resolve(false);
    };
    image.src = url;
});

export const loadQuizPhotos = async (titles: string[]): Promise<Record<string, string>> => {
    const uniqueTitles = [...new Set(titles)];
    const uncached = uniqueTitles.filter((title) => !photoCache.has(title));

    if (uncached.length > 0) {
        const urls = await fetchThumbnailUrls(uncached);
        await Promise.all([...urls].map(async ([title, url]) => {
            if (await canLoadImage(url)) {
                photoCache.set(title, url);
            }
        }));
    }

    return Object.fromEntries(
        uniqueTitles.flatMap((title) => photoCache.has(title) ? [[title, photoCache.get(title) as string]] : []),
    );
};
