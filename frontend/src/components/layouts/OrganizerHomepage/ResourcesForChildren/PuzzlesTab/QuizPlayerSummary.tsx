import React from 'react';
import {t} from '@lingui/macro';
import {IdParam, QuizPlayerSession} from '../../../../../types.ts';
import {useGetQuizPlayerProfile} from '../../../../../queries/useGetQuizPlayerProfile.ts';
import classes from '../ResourcesForChildren.module.scss';

interface QuizPlayerSummaryProps {
    organizerId: IdParam;
    session: QuizPlayerSession;
}

export const QuizPlayerSummary: React.FC<QuizPlayerSummaryProps> = ({organizerId, session}) => {
    const {data: profile} = useGetQuizPlayerProfile(organizerId, session.token);

    const highScore = Math.max(0, ...(profile?.totals.map((totals) => totals.best_percentage) ?? []));
    const totalScore = profile?.totals.reduce((sum, totals) => sum + totals.total_points, 0) ?? 0;

    return (
        <div className={classes.playerSummary} data-testid="puzzles-player-summary">
            <span className={classes.playerGreeting}>{t`Hello ${session.username}`}</span>
            {profile && (
                <span className={classes.playerScores}>
                    <span data-testid="puzzles-high-score">{t`High score: ${highScore}%`}</span>
                    <span data-testid="puzzles-total-score">{t`Total score: ${totalScore}`}</span>
                </span>
            )}
        </div>
    );
};

export default QuizPlayerSummary;
