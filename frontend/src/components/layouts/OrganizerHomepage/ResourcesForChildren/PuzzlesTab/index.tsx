import {useCallback, useEffect, useState} from 'react';
import {t} from '@lingui/macro';
import {IconClock, IconPuzzle, IconRefresh, IconTrophy} from '@tabler/icons-react';
import {WORD_PUZZLES} from './wordPuzzlesData.ts';
import {getQuizPercentage, getQuizRank, QuizRank, shuffle} from './quizScoring.ts';
import classes from '../ResourcesForChildren.module.scss';

const SECONDS_PER_QUESTION = 30;
const BEST_SCORE_STORAGE_KEY = 'fos_word_quiz_best';

type QuizStage = 'intro' | 'playing' | 'result';

const readBestPercentage = (): number | null => {
    try {
        const stored = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
        return stored === null ? null : Number(stored);
    } catch {
        return null;
    }
};

const writeBestPercentage = (percentage: number) => {
    try {
        window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(percentage));
    } catch {
        return;
    }
};

const rankContent = (rank: QuizRank) => {
    switch (rank) {
        case 'HIGH_FLYER':
            return {title: t`High Flyer!`, message: t`Outstanding! You have an excellent vocabulary.`};
        case 'FLYER':
            return {title: t`Flyer`, message: t`Well done! You have a strong vocabulary.`};
        case 'JUST_A_FLYER':
            return {title: t`Just a Flyer`, message: t`Good effort! A little more practice and you'll soar.`};
        default:
            return {
                title: t`Keep Learning`,
                message: t`We recommend learning some new words and taking the test again.`,
            };
    }
};

export const PuzzlesTab = () => {
    const [stage, setStage] = useState<QuizStage>('intro');
    const [questionOptions, setQuestionOptions] = useState<string[][]>([]);
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
    const [bestPercentage, setBestPercentage] = useState<number | null>(null);

    const total = WORD_PUZZLES.length;

    useEffect(() => {
        setBestPercentage(readBestPercentage());
    }, []);

    const finish = useCallback((finalScore: number) => {
        const percentage = getQuizPercentage(finalScore, total);
        setBestPercentage((previous) => {
            const best = Math.max(previous ?? 0, percentage);
            writeBestPercentage(best);
            return best;
        });
        setStage('result');
    }, [total]);

    const advance = useCallback((finalScore: number) => {
        if (current + 1 >= total) {
            finish(finalScore);
            return;
        }
        setCurrent(current + 1);
        setTimeLeft(SECONDS_PER_QUESTION);
    }, [current, total, finish]);

    const answer = useCallback((choice: string | null) => {
        const isCorrect = choice !== null && choice === WORD_PUZZLES[current].answer;
        const nextScore = isCorrect ? score + 1 : score;
        setScore(nextScore);
        advance(nextScore);
    }, [current, score, advance]);

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

    const start = () => {
        setQuestionOptions(WORD_PUZZLES.map((puzzle) => shuffle(puzzle.options)));
        setCurrent(0);
        setScore(0);
        setTimeLeft(SECONDS_PER_QUESTION);
        setStage('playing');
    };

    if (stage === 'intro') {
        return (
            <div className={classes.tabPanel}>
                <div className={classes.puzzleCard}>
                    <IconPuzzle size={40} className={classes.puzzleIcon}/>
                    <h3 className={classes.puzzleTitle}>{t`Word Power Challenge`}</h3>
                    <p className={classes.puzzleText}>
                        {t`${total} word puzzles for senior school students. Choose the right answer from 4 choices. You have ${SECONDS_PER_QUESTION} seconds for each question.`}
                    </p>
                    {bestPercentage !== null && (
                        <p className={classes.puzzleText}>{t`Your best score so far: ${bestPercentage}%`}</p>
                    )}
                    <button type="button" className={classes.storySubmit} onClick={start}>
                        {t`Start the challenge`}
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
                    <button type="button" className={classes.storySubmit} onClick={start}>
                        <IconRefresh size={16}/> {t`Take the test again`}
                    </button>
                </div>
            </div>
        );
    }

    const puzzle = WORD_PUZZLES[current];

    return (
        <div className={classes.tabPanel}>
            <div className={classes.puzzleCard}>
                <div className={classes.quizHeader}>
                    <span>{t`Question ${current + 1} of ${total}`}</span>
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
