import React, {useState} from 'react';
import {t} from '@lingui/macro';
import {IconLoader2, IconLock} from '@tabler/icons-react';
import {IdParam, QuizPlayerSession} from '../../../../../types.ts';
import {useResetQuizPlayerPassword} from '../../../../../mutations/useResetQuizPlayerPassword.ts';
import classes from '../ResourcesForChildren.module.scss';

interface QuizResetPasswordFormProps {
    organizerId: IdParam;
    token: string;
    onReset: (session: QuizPlayerSession) => void;
    onCancel: () => void;
}

export const QuizResetPasswordForm: React.FC<QuizResetPasswordFormProps> = ({organizerId, token, onReset, onCancel}) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const mutation = useResetQuizPlayerPassword(organizerId);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (password.length < 6) {
            setError(t`Your password needs at least 6 characters`);
            return;
        }

        setError(null);
        mutation.mutate({token, password}, {
            onSuccess: (response) => onReset(response.data),
            onError: (err: any) => setError(
                err?.response?.data?.errors?.token?.[0]
                || err?.response?.data?.message
                || t`Something went wrong. Please try again.`
            ),
        });
    };

    return (
        <div className={classes.puzzleCard}>
            <IconLock size={40} className={classes.puzzleIcon}/>
            <h3 className={classes.puzzleTitle}>{t`Choose a new password`}</h3>
            <form onSubmit={handleSubmit} className={classes.saveForm}>
                <input
                    type="password"
                    className={classes.saveInput}
                    placeholder={t`New password (at least 6 characters)`}
                    aria-label={t`New password`}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className={classes.saveError} role="alert">{error}</p>}
                <button
                    type="submit"
                    className={classes.primaryButton}
                    disabled={mutation.isPending}
                    data-testid="puzzles-reset-submit"
                >
                    {mutation.isPending && <IconLoader2 size={16}/>}
                    {t`Save new password`}
                </button>
                <button type="button" className={classes.linkButton} onClick={onCancel}>
                    {t`Cancel`}
                </button>
            </form>
        </div>
    );
};

export default QuizResetPasswordForm;
