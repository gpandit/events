import {PuzzleRow, PuzzleSubject} from '../puzzleTypes.ts';

export type PictureItem = [name: string, visual: string];

const hash = (text: string): number => {
    let value = 2166136261;
    for (let i = 0; i < text.length; i++) {
        value ^= text.charCodeAt(i);
        value = Math.imul(value, 16777619);
    }
    return value >>> 0;
};

const pickDistractors = (answer: string, pool: readonly string[]): string[] => {
    const candidates = [...new Set(pool)].filter((name) => name !== answer);
    return candidates
        .map((name) => ({name, key: hash(`${answer}|${name}`)}))
        .sort((a, b) => a.key - b.key)
        .slice(0, 3)
        .map(({name}) => name);
};

export const identify = (
    subject: PuzzleSubject,
    question: string,
    kind: 'emoji' | 'photo',
    items: PictureItem[],
    extraDistractors: string[] = [],
): PuzzleRow[] => {
    const pool = [...items.map(([name]) => name), ...extraDistractors];
    return items.map(([name, visual]) => {
        const [first, second, third] = pickDistractors(name, pool);
        return [subject, question, name, first, second, third, `${kind}:${visual}`];
    });
};

export const classify = (
    subject: PuzzleSubject,
    question: string,
    kind: 'emoji' | 'photo',
    items: PictureItem[],
    categories: string[],
): PuzzleRow[] => items.map(([category, visual]) => {
    const [first, second, third] = pickDistractors(category, categories);
    return [subject, question, category, first, second, third, `${kind}:${visual}`];
});

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const firstLetter = (items: PictureItem[]): PuzzleRow[] => items.map(([name, visual]) => {
    const answer = name[0].toUpperCase();
    const [first, second, third] = pickDistractors(answer, LETTERS);
    return ['Language', 'Which letter does the name of this picture start with?', answer, first, second, third, `emoji:${visual}`];
});

const misspellings = (word: string): string[] => {
    const middle = Math.floor(word.length / 2);
    let at = middle - 1;
    while (at < word.length - 1 && word[at] === word[at + 1]) {
        at++;
    }
    const swapped = word.slice(0, at) + word[at + 1] + word[at] + word.slice(at + 2);
    const dropped = word.slice(0, middle) + word.slice(middle + 1);
    const doubled = word.slice(0, middle) + word[middle] + word.slice(middle);
    return [swapped, dropped, doubled];
};

export const spellIt = (items: PictureItem[]): PuzzleRow[] => items.map(([name, visual]) => {
    const [first, second, third] = misspellings(name);
    return ['Language', 'Which is the correct spelling for this picture?', name, first, second, third, `emoji:${visual}`];
});

export const counting = (items: [emoji: string, name: string, count: number][]): PuzzleRow[] => items.map(([emoji, name, count]) => {
    const wrong = [count + 1, count + 2, Math.max(1, count - 1) === count ? count + 3 : count - 1];
    const options = [...new Set(wrong)].filter((value) => value !== count);
    while (options.length < 3) {
        options.push(count + options.length + 3);
    }
    return [
        'Maths',
        `How many ${name} can you count?`,
        String(count),
        String(options[0]),
        String(options[1]),
        String(options[2]),
        `emoji:${emoji.repeat(count)}`,
    ];
});
