import React, {useEffect, useRef, useState} from 'react';
import {t} from '@lingui/macro';
import {IconLoader2, IconStarFilled} from '@tabler/icons-react';
import {IdParam, QuizPlayerSession, QuizResultOutcome} from '../../../../../types.ts';
import {useSubmitQuizResult} from '../../../../../mutations/useSubmitQuizResult.ts';
import {QuizAuthForm} from './QuizAuthForm.tsx';
import classes from '../ResourcesForChildren.module.scss';

interface SaveScorePromptProps {
    organizerId: IdParam;
    session: QuizPlayerSession | null;
    onAuthenticated: (session: QuizPlayerSession) => void;
    ageBand: string;
    score: number;
    total: number;
}

type PromptStage = 'ask' | 'auth' | 'declined';

interface SaveResultProps extends Omit<SaveScorePromptProps, 'session' | 'onAuthenticated'> {
    session: QuizPlayerSession;
}

const SaveResult: React.FC<SaveResultProps> = ({organizerId, session, ageBand, score, total}) => {
    const mutation = useSubmitQuizResult(organizerId, session.token);
    const [outcome, setOutcome] = useState<QuizResultOutcome | null>(null);
    const submitted = useRef(false);

    useEffect(() => {
        if (submitted.current) {
            return;
        }
        submitted.current = true;
        mutation.mutate(
            {age_band: ageBand, score, total_questions: total},
            {onSuccess: (response) => setOutcome(response.data)},
        );
    }, []);

    if (mutation.isError) {
        return <p className={classes.saveError} role="alert">{t`We could not save your score. Please try again later.`}</p>;
    }

    if (!outcome) {
        return <p className={classes.puzzleText}><IconLoader2 size={16}/> {t`Saving your score...`}</p>;
    }

    return (
        <div className={classes.pointsBadge} data-testid="puzzles-points-earned">
            <IconStarFilled size={20}/>
            <span>{t`You earned ${outcome.points_awarded} points!`}</span>
            <span className={classes.pointsTotal}>
                {t`${session.username} now has ${outcome.total_points} points in this age group.`}
            </span>
        </div>
    );
};

export const SaveScorePrompt: React.FC<SaveScorePromptProps> = ({
                                                                   organizerId,
                                                                   session,
                                                                   onAuthenticated,
                                                                   ageBand,
                                                                   score,
                                                                   total,
                                                               }) => {
    const [stage, setStage] = useState<PromptStage>('ask');

    if (session) {
        return (
            <SaveResult
                organizerId={organizerId}
                session={session}
                ageBand={ageBand}
                score={score}
                total={total}
            />
        );
    }

    if (stage === 'declined') {
        return null;
    }

    if (stage === 'auth') {
        return <QuizAuthForm organizerId={organizerId} onAuthenticated={onAuthenticated}/>;
    }

    return (
        <div className={classes.savePrompt}>
            <p className={classes.puzzleSubtitle}>{t`Would you like to save your score and earn points?`}</p>
            <div className={classes.saveActions}>
                <button
                    type="button"
                    className={classes.primaryButton}
                    onClick={() => setStage('auth')}
                    data-testid="puzzles-save-score-yes"
                >
                    {t`Yes, save my score`}
                </button>
                <button
                    type="button"
                    className={classes.linkButton}
                    onClick={() => setStage('declined')}
                    data-testid="puzzles-save-score-no"
                >
                    {t`No thanks`}
                </button>
            </div>
        </div>
    );
};

export default SaveScorePrompt;
