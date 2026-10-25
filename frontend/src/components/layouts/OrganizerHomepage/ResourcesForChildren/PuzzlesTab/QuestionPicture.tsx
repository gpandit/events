import {t} from '@lingui/macro';
import {PuzzleVisual} from './puzzleTypes.ts';
import classes from '../ResourcesForChildren.module.scss';

interface QuestionPictureProps {
    visual: PuzzleVisual;
    photos: Record<string, string>;
    small?: boolean;
}

export const QuestionPicture = ({visual, photos, small = false}: QuestionPictureProps) => {
    if (visual.kind === 'photo') {
        const source = photos[visual.value];
        return source ? (
            <img
                src={source}
                alt={t`Picture for this question`}
                referrerPolicy="no-referrer"
                className={small ? classes.reviewPhoto : classes.puzzlePhoto}
                data-testid="puzzles-photo"
            />
        ) : null;
    }

    return (
        <div
            role="img"
            aria-label={t`Picture for this question`}
            className={small ? classes.reviewEmoji : classes.puzzleEmoji}
            data-testid="puzzles-emoji"
        >
            {visual.value}
        </div>
    );
};
