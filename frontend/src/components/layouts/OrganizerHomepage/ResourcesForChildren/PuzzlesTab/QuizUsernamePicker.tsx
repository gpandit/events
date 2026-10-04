import {useState} from 'react';
import {t} from '@lingui/macro';
import {IconChevronLeft, IconChevronRight, IconLoader2} from '@tabler/icons-react';
import classes from '../ResourcesForChildren.module.scss';

interface QuizUsernamePickerProps {
    options: string[] | undefined;
    isLoading: boolean;
    isError: boolean;
    value: string;
    onChange: (username: string) => void;
    onRetry: () => void;
}

const PAGE_SIZE = 5;

export const QuizUsernamePicker = ({options, isLoading, isError, value, onChange, onRetry}: QuizUsernamePickerProps) => {
    const [page, setPage] = useState(0);

    if (isLoading) {
        return <IconLoader2 size={20} aria-label={t`Loading usernames`}/>;
    }

    if (isError || !options?.length) {
        return (
            <button type="button" className={classes.linkButton} onClick={onRetry}>
                {t`We could not load usernames. Try again`}
            </button>
        );
    }

    const pageCount = Math.ceil(options.length / PAGE_SIZE);
    const visible = options.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <div className={classes.usernamePicker} data-testid="puzzles-username-picker">
            <p className={classes.puzzleText}>{t`Pick your username`}</p>
            <div className={classes.usernameOptions} role="radiogroup" aria-label={t`Pick your username`}>
                {visible.map((username) => (
                    <button
                        key={username}
                        type="button"
                        role="radio"
                        aria-checked={value === username}
                        className={value === username ? classes.usernameOptionActive : classes.usernameOption}
                        onClick={() => onChange(username)}
                        data-testid="puzzles-username-option"
                    >
                        {username}
                    </button>
                ))}
            </div>
            {pageCount > 1 && (
                <div className={classes.usernamePager}>
                    <button
                        type="button"
                        className={classes.linkButton}
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                        data-testid="puzzles-username-back"
                    >
                        <IconChevronLeft size={16}/>{t`Back`}
                    </button>
                    <span className={classes.fieldHint}>{page + 1} / {pageCount}</span>
                    <button
                        type="button"
                        className={classes.linkButton}
                        disabled={page === pageCount - 1}
                        onClick={() => setPage(page + 1)}
                        data-testid="puzzles-username-next"
                    >
                        {t`Next`}<IconChevronRight size={16}/>
                    </button>
                </div>
            )}
        </div>
    );
};
