import React from 'react';
import {Tabs} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconCrown, IconMedal, IconTrophy} from '@tabler/icons-react';
import {IdParam} from '../../../../../types.ts';
import {useGetQuizLeaderboard} from '../../../../../queries/useGetQuizLeaderboard.ts';
import {AGE_BANDS, AgeBand} from './generalKnowledgePuzzles.ts';
import {ageBandLabel} from './quizLabels.ts';
import classes from '../ResourcesForChildren.module.scss';

interface QuizLeaderboardPanelProps {
    organizerId: IdParam;
    ageBand: AgeBand;
    onAgeBandChange: (ageBand: AgeBand) => void;
    username?: string;
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

export const QuizLeaderboardPanel: React.FC<QuizLeaderboardPanelProps> = ({
                                                                              organizerId,
                                                                              ageBand,
                                                                              onAgeBandChange,
                                                                              username,
                                                                          }) => {
    const {data: entries, isLoading, isError} = useGetQuizLeaderboard(organizerId, ageBand);

    return (
        <aside className={classes.leaderboardPane} data-testid="puzzles-leaderboard-pane">
            <h3 className={classes.leaderboardTitle}><IconTrophy size={20}/> {t`Leaderboard`}</h3>
            <p className={classes.puzzleText}>{t`The top players in each age group. Only usernames are shown.`}</p>

            <Tabs
                value={ageBand}
                onChange={(next) => next && onAgeBandChange(next as AgeBand)}
                className={classes.tabs}
            >
                <Tabs.List grow>
                    {AGE_BANDS.map((band) => (
                        <Tabs.Tab
                            key={band}
                            value={band}
                            aria-label={ageBandLabel(band)}
                            data-testid={`puzzles-leaderboard-age-${band}`}
                        >
                            {band.replace('-', '–')}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs>

            <p className={classes.leaderboardAgeLabel}>{ageBandLabel(ageBand)}</p>

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
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </aside>
    );
};

export default QuizLeaderboardPanel;
