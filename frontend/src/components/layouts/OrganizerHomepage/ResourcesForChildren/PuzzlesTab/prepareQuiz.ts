import {Puzzle} from './puzzleTypes.ts';
import {loadQuizPhotos} from './quizPhotos.ts';
import {selectMixedQuestions, shuffle} from './quizScoring.ts';

export interface PreparedQuiz {
    puzzles: Puzzle[];
    photos: Record<string, string>;
}

const photoTitle = (puzzle: Puzzle): string | null => puzzle.visual?.kind === 'photo' ? puzzle.visual.value : null;

export const prepareQuiz = async (
    pool: readonly Puzzle[],
    recentTests: readonly (readonly string[])[],
    count: number,
    pictureCount: number,
    loadPhotos: (titles: string[]) => Promise<Record<string, string>> = loadQuizPhotos,
): Promise<PreparedQuiz> => {
    const selected = selectMixedQuestions(pool, recentTests, count, (puzzle) => puzzle.visual !== undefined, pictureCount);
    const titles = selected.flatMap((puzzle) => photoTitle(puzzle) ?? []);
    const photos = titles.length > 0 ? await loadPhotos(titles) : {};

    const playable = selected.filter((puzzle) => {
        const title = photoTitle(puzzle);
        return title === null || photos[title] !== undefined;
    });

    const takenIds = new Set([...selected.map(({id}) => id), ...recentTests.flat()]);
    const replacements = shuffle(pool.filter((puzzle) => photoTitle(puzzle) === null && !takenIds.has(puzzle.id)))
        .slice(0, selected.length - playable.length);

    return {puzzles: shuffle([...playable, ...replacements]), photos};
};
