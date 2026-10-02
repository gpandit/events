import {t} from '@lingui/macro';
import {IconPuzzle} from '@tabler/icons-react';
import classes from '../ResourcesForChildren.module.scss';

export const PuzzlesTab = () => {
    return (
        <div className={classes.tabPanel}>
            <div className={classes.puzzleComingSoon}>
                <IconPuzzle size={40} className={classes.puzzleIcon}/>
                <p className={classes.comingSoon}>
                    {t`Puzzles are coming soon! Check back for fun brain-teasers and activity sheets.`}
                </p>
            </div>
        </div>
    );
};

export default PuzzlesTab;
