import React from 'react';
import {t} from '@lingui/macro';
import {IconArrowLeft, IconCheck, IconX} from '@tabler/icons-react';
import {Puzzle} from './puzzleTypes.ts';
import {subjectLabel} from './quizLabels.ts';
import classes from '../ResourcesForChildren.module.scss';

interface AnswerReviewProps {
    puzzles: Puzzle[];
    questionOptions: string[][];
    answers: (string | null)[];
    onBack: () => void;
}

export const AnswerReview: React.FC<AnswerReviewProps> = ({puzzles, questionOptions, answers, onBack}) => {
    const mistakes = puzzles
        .map((puzzle, index) => ({puzzle, index, chosen: answers[index] ?? null}))
        .filter(({puzzle, chosen}) => chosen !== puzzle.answer);

    return (
        <div className={classes.puzzleCard}>
            <h3 className={classes.puzzleTitle}>{t`Review your answers`}</h3>
            <p className={classes.puzzleText}>
                {t`Here are the questions you missed. The correct answer is shown in green.`}
            </p>

            <ol className={classes.reviewList} data-testid="puzzles-review-list">
                {mistakes.map(({puzzle, index, chosen}) => (
                    <li key={puzzle.id} className={classes.reviewItem} data-testid="puzzles-review-item">
                        <span className={classes.reviewMeta}>
                            {t`Question ${index + 1}`} · {subjectLabel(puzzle.subject)}
                        </span>
                        <p className={classes.reviewQuestion}>{puzzle.question}</p>
                        <div className={classes.reviewOptions}>
                            {questionOptions[index].map((option) => {
                                const isCorrect = option === puzzle.answer;
                                const isChosen = option === chosen;
                                const className = isCorrect
                                    ? classes.reviewOptionCorrect
                                    : isChosen ? classes.reviewOptionWrong : classes.reviewOption;

                                return (
                                    <div
                                        key={option}
                                        className={className}
                                        data-testid={isCorrect ? 'puzzles-review-correct' : isChosen ? 'puzzles-review-wrong' : undefined}
                                    >
                                        <span>{option}</span>
                                        {isCorrect && (
                                            <span className={classes.reviewTag}>
                                                <IconCheck size={14}/> {t`Correct answer`}
                                            </span>
                                        )}
                                        {isChosen && !isCorrect && (
                                            <span className={classes.reviewTag}>
                                                <IconX size={14}/> {t`Your answer`}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {chosen === null && (
                            <p className={classes.reviewTimeout}>{t`Time ran out before you answered this one.`}</p>
                        )}
                    </li>
                ))}
            </ol>

            <button type="button" className={classes.primaryButton} onClick={onBack} data-testid="puzzles-review-back">
                <IconArrowLeft size={16}/> {t`Back to my results`}
            </button>
        </div>
    );
};

export default AnswerReview;
