import manifest from './quizPhotoManifest.json';

const PHOTO_BASE_PATH = '/quiz-photos/';
const PHOTO_FILES: Record<string, string> = manifest;

export const HAS_QUIZ_PHOTOS = Object.keys(PHOTO_FILES).length > 0;

export const QUIZ_PHOTO_CREDITS_PATH = `${PHOTO_BASE_PATH}credits.html`;

export const loadQuizPhotos = async (titles: string[]): Promise<Record<string, string>> =>
    Object.fromEntries(
        [...new Set(titles)].flatMap((title) => title in PHOTO_FILES ? [[title, `${PHOTO_BASE_PATH}${PHOTO_FILES[title]}`]] : []),
    );
