import {AgeBand, Puzzle, PuzzleRow} from './puzzleTypes.ts';
import {AGE_5_TO_7} from './questionBank/age5to7.ts';
import {AGE_8_TO_10} from './questionBank/age8to10.ts';
import {AGE_11_TO_13} from './questionBank/age11to13.ts';
import {AGE_14_TO_17} from './questionBank/age14to17.ts';

export type {AgeBand, Puzzle, PuzzleSubject} from './puzzleTypes.ts';

const toPuzzles = (rows: PuzzleRow[]): Puzzle[] => rows.map(([subject, question, answer, ...wrong]) => ({
    id: `${question}|${answer}`,
    subject,
    question,
    answer,
    options: [answer, ...wrong] as Puzzle['options'],
}));

export const AGE_BANDS: AgeBand[] = ['5-7', '8-10', '11-13', '14-17'];

export const PUZZLES_BY_AGE_BAND: Record<AgeBand, Puzzle[]> = {
    '5-7': toPuzzles(AGE_5_TO_7),
    '8-10': toPuzzles(AGE_8_TO_10),
    '11-13': toPuzzles(AGE_11_TO_13),
    '14-17': toPuzzles(AGE_14_TO_17),
};
