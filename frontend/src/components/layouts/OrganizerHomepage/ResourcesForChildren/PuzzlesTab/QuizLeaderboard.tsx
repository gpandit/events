import React, {useState} from 'react';
import {t} from '@lingui/macro';
import {IconArrowLeft, IconCrown, IconMedal} from '@tabler/icons-react';
import {IdParam} from '../../../../../types.ts';
import {useGetQuizLeaderboard} from '../../../../../queries/useGetQuizLeaderboard.ts';
import {AGE_BANDS, AgeBand} from './generalKnowledgePuzzles.ts';
import {ageBandLabel} from './quizLabels.ts';
import classes from '../ResourcesForChildren.module.scss';

interface QuizLeaderboardProps {
    organizerId: IdParam;
    initialAgeBand: AgeBand | null;
    username?: string;
    onBack: () => void;
}

const RankBadge = ({rank}: { rank: number }) => {
    if (rank === 1) {
        return <IconCrown size={18} className={classes.rankGold} aria-label={t`First place`}/>;
    }
    if (rank <= 3) {
        return <IconMedal size={18} className={classes.rankMedal} aria-label={t`Top three`}/>;
    }
    return null;
};

export const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({organizerId, initialAgeBand, username, onBack}) => {
    const [ageBand, setAgeBand] = useState<AgeBand>(initialAgeBand ?? AGE_BANDS[0]);
    const {data: entries, isLoading, isError} = useGetQuizLeaderboard(organizerId, ageBand);

    return (
        <div className={classes.puzzleCard}>
            <h3 className={classes.puzzleTitle}>{t`Leaderboard`}</h3>
            <p className={classes.puzzleText}>{t`The top players in each age group. Only usernames are shown.`}</p>

            <div className={classes.ageOptions} role="radiogroup" aria-label={t`Choose an age group`}>
                {AGE_BANDS.map((band) => (
                    <button
                        key={band}
                        type="button"
                        role="radio"
                        aria-checked={ageBand === band}
                        className={ageBand === band ? classes.ageOptionActive : classes.ageOption}
                        onClick={() => setAgeBand(band)}
                        data-testid={`puzzles-leaderboard-age-${band}`}
                    >
                        {ageBandLabel(band)}
                    </button>
                ))}
            </div>

            {isLoading && <p className={classes.puzzleText}>{t`Loading...`}</p>}
            {isError && <p className={classes.saveError} role="alert">{t`The leaderboard could not be loaded.`}</p>}
            {entries && entries.length === 0 && (
                <p className={classes.puzzleText}>{t`No scores yet for this age group. Be the first!`}</p>
            )}
            {entries && entries.length > 0 && (
                <table className={classes.leaderboardTable} data-testid="puzzles-leaderboard-table">
                    <thead>
                    <tr>
                        <th scope="col">{t`Rank`}</th>
                        <th scope="col">{t`Player`}</th>
                        <th scope="col">{t`Points`}</th>
                        <th scope="col" className={classes.hideOnMobile}>{t`Tests`}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {entries.map((entry) => (
                        <tr
                            key={entry.username}
                            className={entry.username === username ? classes.leaderboardRowMe : undefined}
                            data-testid="puzzles-leaderboard-row"
                        >
                            <td><span className={classes.rankCell}>{entry.rank} <RankBadge rank={entry.rank}/></span></td>
                            <td>{entry.username}</td>
                            <td>{entry.total_points}</td>
                            <td className={classes.hideOnMobile}>{entry.tests_taken}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <button type="button" className={classes.linkButton} onClick={onBack}>
                <IconArrowLeft size={14}/> {t`Back`}
            </button>
        </div>
    );
};

export default QuizLeaderboard;
