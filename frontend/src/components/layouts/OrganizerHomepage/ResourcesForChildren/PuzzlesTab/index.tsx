import {useCallback, useEffect, useState} from 'react';
import {t} from '@lingui/macro';
import {IconClock, IconPuzzle, IconRefresh, IconTrophy} from '@tabler/icons-react';
import {Organizer} from '../../../../../types.ts';
import {AGE_BANDS, AgeBand, Puzzle, PUZZLES_BY_AGE_BAND, PuzzleSubject} from './generalKnowledgePuzzles.ts';
import {getQuizPercentage, getQuizRank, QuizRank, rememberTest, selectQuizQuestions, shuffle} from './quizScoring.ts';
import {SaveScorePrompt} from './SaveScorePrompt.tsx';
import classes from '../ResourcesForChildren.module.scss';

const SECONDS_PER_QUESTION = 30;
const QUESTIONS_PER_TEST = 20;
const BEST_SCORE_STORAGE_KEY = 'fos_general_knowledge_quiz_best';
const RECENT_TESTS_STORAGE_KEY = 'fos_general_knowledge_quiz_recent';

type QuizStage = 'intro' | 'playing' | 'result';

type BestScores = Partial<Record<AgeBand, number>>;

type RecentTests = Partial<Record<AgeBand, string[][]>>;

interface PuzzlesTabProps {
    organizer: Organizer;
}

const readBestScores = (): BestScores => {
    try {
        const stored = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
        return stored ? JSON.parse(stored) as BestScores : {};
    } catch {
        return {};
    }
};

const writeBestScores = (scores: BestScores) => {
    try {
        window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, JSON.stringify(scores));
    } catch {
        return;
    }
};

const readRecentTests = (): RecentTests => {
    try {
        const stored = window.localStorage.getItem(RECENT_TESTS_STORAGE_KEY);
        return stored ? JSON.parse(stored) as RecentTests : {};
    } catch {
        return {};
    }
};

const writeRecentTests = (recent: RecentTests) => {
    try {
        window.localStorage.setItem(RECENT_TESTS_STORAGE_KEY, JSON.stringify(recent));
    } catch {
        return;
    }
};

const ageBandLabel = (band: AgeBand) => {
    switch (band) {
        case '5-7':
            return t`Ages 5 to 7`;
        case '8-10':
            return t`Ages 8 to 10`;
        case '11-13':
            return t`Ages 11 to 13`;
        default:
            return t`Ages 14 to 17`;
    }
};

const subjectLabel = (subject: PuzzleSubject) => {
    switch (subject) {
        case 'English':
            return t`English`;
        case 'Science':
            return t`Science`;
        case 'Maths':
            return t`Maths`;
        case 'Geography':
            return t`Geography`;
        default:
            return t`History`;
    }
};

const rankContent = (rank: QuizRank) => {
    switch (rank) {
        case 'HIGH_FLYER':
            return {title: t`High Flyer!`, message: t`Outstanding! You really know your stuff.`};
        case 'FLYER':
            return {title: t`Flyer`, message: t`Well done! You have great general knowledge.`};
        case 'JUST_A_FLYER':
            return {title: t`Just a Flyer`, message: t`Good effort! A little more practice and you'll soar.`};
        default:
            return {
                title: t`Keep Learning`,
                message: t`Keep exploring and learning new things, then try the test again.`,
            };
    }
};

export const PuzzlesTab = ({organizer}: PuzzlesTabProps) => {
    const [stage, setStage] = useState<QuizStage>('intro');
    const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const [questionOptions, setQuestionOptions] = useState<string[][]>([]);
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
    const [bestScores, setBestScores] = useState<BestScores>({});
    const [attempt, setAttempt] = useState(0);

    const total = puzzles.length;

    useEffect(() => {
        setBestScores(readBestScores());
    }, []);

    const finish = useCallback((finalScore: number) => {
        if (ageBand) {
            const percentage = getQuizPercentage(finalScore, total);
            setBestScores((previous) => {
                const next = {...previous, [ageBand]: Math.max(previous[ageBand] ?? 0, percentage)};
                writeBestScores(next);
                return next;
            });
        }
        setStage('result');
    }, [ageBand, total]);

    const advance = useCallback((finalScore: number) => {
        if (current + 1 >= total) {
            finish(finalScore);
            return;
        }
        setCurrent(current + 1);
        setTimeLeft(SECONDS_PER_QUESTION);
    }, [current, total, finish]);

    const answer = useCallback((choice: string | null) => {
        const isCorrect = choice !== null && choice === puzzles[current].answer;
        const nextScore = isCorrect ? score + 1 : score;
        setScore(nextScore);
        advance(nextScore);
    }, [puzzles, current, score, advance]);

    useEffect(() => {
        if (stage !== 'playing') {
            return;
        }

        if (timeLeft === 0) {
            answer(null);
            return;
        }

        const timer = window.setTimeout(() => setTimeLeft((seconds) => seconds - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [stage, timeLeft, answer]);

    const start = (band: AgeBand) => {
        const recent = readRecentTests();
        const selected = selectQuizQuestions(PUZZLES_BY_AGE_BAND[band], recent[band] ?? [], QUESTIONS_PER_TEST);
        writeRecentTests({...recent, [band]: rememberTest(recent[band] ?? [], selected.map((puzzle) => puzzle.id))});
        setAgeBand(band);
        setPuzzles(selected);
        setQuestionOptions(selected.map((puzzle) => shuffle(puzzle.options)));
        setCurrent(0);
        setScore(0);
        setAttempt((previous) => previous + 1);
        setTimeLeft(SECONDS_PER_QUESTION);
        setStage('playing');
    };

    const bestPercentage = ageBand ? bestScores[ageBand] ?? null : null;

    if (stage === 'intro') {
        return (
            <div className={classes.tabPanel}>
                <div className={classes.puzzleCard}>
                    <IconPuzzle size={40} className={classes.puzzleIcon}/>
                    <h3 className={classes.puzzleTitle}>{t`General Knowledge Challenge`}</h3>
                    <p className={classes.puzzleText}>
                        {t`English, Science, Maths, Geography and History questions. Choose your age group, then answer ${QUESTIONS_PER_TEST} questions. Pick the right answer from 4 choices. You have ${SECONDS_PER_QUESTION} seconds for each question.`}
                    </p>
                    <p className={classes.puzzleSubtitle}>{t`Choose your age group`}</p>
                    <div className={classes.ageOptions} role="radiogroup" aria-label={t`Choose your age group`}>
                        {AGE_BANDS.map((band) => (
                            <button
                                key={band}
                                type="button"
                                role="radio"
                                aria-checked={ageBand === band}
                                className={ageBand === band ? classes.ageOptionActive : classes.ageOption}
                                onClick={() => setAgeBand(band)}
                                data-testid={`puzzles-age-${band}`}
                            >
                                {ageBandLabel(band)}
                                {bestScores[band] !== undefined && (
                                    <span className={classes.ageOptionBest}>{t`Best: ${bestScores[band]}%`}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        className={classes.primaryButton}
                        onClick={() => ageBand && start(ageBand)}
                        disabled={!ageBand}
                        data-testid="puzzles-start-button"
                    >
                        {t`Start the test`}
                    </button>
                </div>
            </div>
        );
    }

    if (stage === 'result') {
        const percentage = getQuizPercentage(score, total);
        const {title, message} = rankContent(getQuizRank(percentage));

        return (
            <div className={classes.tabPanel}>
                <div className={classes.puzzleCard}>
                    <IconTrophy size={40} className={classes.puzzleIcon}/>
                    <h3 className={classes.puzzleTitle}>{title}</h3>
                    <p className={classes.puzzleScore}>{t`You scored ${score} out of ${total} (${percentage}%)`}</p>
                    <p className={classes.puzzleText}>{message}</p>
                    {bestPercentage !== null && (
                        <p className={classes.puzzleText}>{t`Your best score: ${bestPercentage}%`}</p>
                    )}
                    {ageBand && (
                        <SaveScorePrompt
                            key={attempt}
                            organizerId={organizer.id}
                            ageBand={ageBand}
                            score={score}
                            total={total}
                        />
                    )}
                    <button type="button" className={classes.primaryButton} onClick={() => ageBand && start(ageBand)}>
                        <IconRefresh size={16}/> {t`Take the test again`}
                    </button>
                    <button type="button" className={classes.linkButton} onClick={() => setStage('intro')}>
                        {t`Choose a different age group`}
                    </button>
                </div>
            </div>
        );
    }

    const puzzle = puzzles[current];

    return (
        <div className={classes.tabPanel}>
            <div className={classes.puzzleCard}>
                <div className={classes.quizHeader}>
                    <span>{t`Question ${current + 1} of ${total}`} · {subjectLabel(puzzle.subject)}</span>
                    <span className={timeLeft <= 5 ? classes.timerLow : classes.timer} aria-live="off">
                        <IconClock size={16}/> {timeLeft}s
                    </span>
                </div>
                <div className={classes.timerTrack}>
                    <div
                        className={classes.timerFill}
                        style={{width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%`}}
                    />
                </div>
                <h3 className={classes.puzzleQuestion}>{puzzle.question}</h3>
                <div className={classes.puzzleOptions}>
                    {questionOptions[current]?.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className={classes.puzzleOption}
                            onClick={() => answer(option)}
                            data-testid="puzzles-option"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PuzzlesTab;
