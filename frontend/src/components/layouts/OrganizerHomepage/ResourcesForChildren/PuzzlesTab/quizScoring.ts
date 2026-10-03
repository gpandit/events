export type QuizRank = 'HIGH_FLYER' | 'FLYER' | 'JUST_A_FLYER' | 'KEEP_LEARNING';

export const getQuizPercentage = (score: number, total: number): number =>
    total === 0 ? 0 : Math.round((score / total) * 100);

export const getQuizRank = (percentage: number): QuizRank => {
    if (percentage > 85) return 'HIGH_FLYER';
    if (percentage > 60) return 'FLYER';
    if (percentage >= 40) return 'JUST_A_FLYER';
    return 'KEEP_LEARNING';
};

export const shuffle = <T, >(items: readonly T[]): T[] => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

export const RECENT_TESTS_TO_AVOID = 4;

export const selectQuizQuestions = <T extends { id: string }>(
    pool: readonly T[],
    recentTests: readonly (readonly string[])[],
    count: number,
): T[] => {
    const recentIds = new Set(recentTests.flat());
    return shuffle(pool.filter((item) => !recentIds.has(item.id))).slice(0, count);
};

export const rememberTest = (
    recentTests: readonly (readonly string[])[],
    questionIds: readonly string[],
): string[][] => [...recentTests, questionIds].slice(-RECENT_TESTS_TO_AVOID).map((ids) => [...ids]);
