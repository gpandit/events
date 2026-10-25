import {AgeBand, Puzzle, PuzzleRow, PuzzleVisual} from './puzzleTypes.ts';
import {AGE_5_TO_7} from './questionBank/age5to7.ts';
import {AGE_8_TO_10} from './questionBank/age8to10.ts';
import {AGE_11_TO_13} from './questionBank/age11to13.ts';
import {AGE_14_TO_17} from './questionBank/age14to17.ts';
import {LANGUAGE_5_TO_7, PICTURES_5_TO_7} from './questionBank/extra5to7.ts';
import {LANGUAGE_8_TO_10, PICTURES_8_TO_10} from './questionBank/extra8to10.ts';
import {LANGUAGE_11_TO_13, PICTURES_11_TO_13} from './questionBank/extra11to13.ts';
import {LANGUAGE_14_TO_17, PICTURES_14_TO_17} from './questionBank/extra14to17.ts';

export type {AgeBand, Puzzle, PuzzleSubject, PuzzleVisual} from './puzzleTypes.ts';

const EMOJI_PREFIX = 'emoji:';
const PHOTO_PREFIX = 'photo:';

const parseVisual = (raw: string | undefined): PuzzleVisual | undefined => {
    if (!raw) {
        return undefined;
    }
    if (raw.startsWith(EMOJI_PREFIX)) {
        return {kind: 'emoji', value: raw.slice(EMOJI_PREFIX.length)};
    }
    if (raw.startsWith(PHOTO_PREFIX)) {
        return {kind: 'photo', value: raw.slice(PHOTO_PREFIX.length)};
    }
    return undefined;
};

const toPuzzles = (rows: PuzzleRow[]): Puzzle[] => rows.map(([subject, question, answer, wrong1, wrong2, wrong3, visual]) => ({
    id: visual ? `${question}|${answer}|${visual}` : `${question}|${answer}`,
    subject,
    question,
    answer,
    options: [answer, wrong1, wrong2, wrong3],
    visual: parseVisual(visual),
}));

export const AGE_BANDS: AgeBand[] = ['5-7', '8-10', '11-13', '14-17'];

export const PUZZLES_BY_AGE_BAND: Record<AgeBand, Puzzle[]> = {
    '5-7': toPuzzles([...AGE_5_TO_7, ...LANGUAGE_5_TO_7, ...PICTURES_5_TO_7]),
    '8-10': toPuzzles([...AGE_8_TO_10, ...LANGUAGE_8_TO_10, ...PICTURES_8_TO_10]),
    '11-13': toPuzzles([...AGE_11_TO_13, ...LANGUAGE_11_TO_13, ...PICTURES_11_TO_13]),
    '14-17': toPuzzles([...AGE_14_TO_17, ...LANGUAGE_14_TO_17, ...PICTURES_14_TO_17]),
};
