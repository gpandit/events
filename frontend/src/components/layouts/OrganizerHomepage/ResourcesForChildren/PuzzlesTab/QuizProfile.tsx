import React, {useEffect} from 'react';
import {t} from '@lingui/macro';
import {IconArrowLeft} from '@tabler/icons-react';
import {IdParam, QuizPlayerSession} from '../../../../../types.ts';
import {useGetQuizPlayerProfile} from '../../../../../queries/useGetQuizPlayerProfile.ts';
import {ageBandLabel} from './quizLabels.ts';
import classes from '../ResourcesForChildren.module.scss';

interface QuizProfileProps {
    organizerId: IdParam;
    session: QuizPlayerSession;
    onSignOut: () => void;
    onBack: () => void;
}

const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const QuizProfile: React.FC<QuizProfileProps> = ({organizerId, session, onSignOut, onBack}) => {
    const {data: profile, isLoading, error} = useGetQuizPlayerProfile(organizerId, session.token);
    const isSessionExpired = (error as any)?.response?.status === 401;

    useEffect(() => {
        if (isSessionExpired) {
            onSignOut();
        }
    }, [isSessionExpired]);

    return (
        <div className={classes.puzzleCard}>
            <h3 className={classes.puzzleTitle}>{t`My scores`}</h3>
            <p className={classes.puzzleText}>{t`Playing as ${session.username}`}</p>

            {isLoading && <p className={classes.puzzleText}>{t`Loading...`}</p>}

            {profile?.leaderboard_status === 'PENDING' && (
                <p className={classes.puzzleText} data-testid="puzzles-leaderboard-pending">
                    {t`You will appear on the leaderboard once your parent or guardian gives permission. We have emailed them.`}
                </p>
            )}

            {profile?.leaderboard_status === 'DECLINED' && (
                <p className={classes.puzzleText}>
                    {t`Your parent or guardian chose not to show you on the leaderboard. You can still play and save your scores.`}
                </p>
            )}

            {profile && profile.results.length === 0 && (
                <p className={classes.puzzleText}>{t`You have not saved any scores yet. Take a test to get started!`}</p>
            )}

            {profile && profile.totals.length > 0 && (
                <div className={classes.statGrid} data-testid="puzzles-profile-totals">
                    {profile.totals.map((totals) => (
                        <div key={totals.age_band} className={classes.statCard}>
                            <span className={classes.statLabel}>{ageBandLabel(totals.age_band)}</span>
                            <span className={classes.statValue}>{totals.total_points}</span>
                            <span className={classes.statLabel}>{t`points`}</span>
                            <span className={classes.statLabel}>
                                {t`${totals.tests_taken} tests · best ${totals.best_percentage}%`}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {profile && profile.results.length > 0 && (
                <table className={classes.leaderboardTable} data-testid="puzzles-profile-results">
                    <thead>
                    <tr>
                        <th scope="col">{t`Date`}</th>
                        <th scope="col">{t`Age group`}</th>
                        <th scope="col">{t`Score`}</th>
                        <th scope="col">{t`Points`}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {profile.results.map((result) => (
                        <tr key={result.id}>
                            <td>{formatDate(result.taken_at)}</td>
                            <td>{ageBandLabel(result.age_band)}</td>
                            <td>{result.score}/{result.total_questions} ({result.percentage}%)</td>
                            <td>{result.points}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <div className={classes.saveActions}>
                <button type="button" className={classes.linkButton} onClick={onBack}>
                    <IconArrowLeft size={14}/> {t`Back`}
                </button>
                <button type="button" className={classes.linkButton} onClick={onSignOut} data-testid="puzzles-sign-out">
                    {t`Sign out`}
                </button>
            </div>
        </div>
    );
};

export default QuizProfile;
