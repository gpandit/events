import React, {useEffect, useRef, useState} from 'react';
import {t} from '@lingui/macro';
import {IconLoader2} from '@tabler/icons-react';
import {IdParam} from '../../../../../types.ts';
import {useGetMe} from '../../../../../queries/useGetMe.ts';
import {useSubmitQuizResult} from '../../../../../mutations/useSubmitQuizResult.ts';
import {showError, showSuccess} from '../../../../../utilites/notifications.tsx';
import classes from '../ResourcesForChildren.module.scss';

interface SaveScorePromptProps {
    organizerId: IdParam;
    ageBand: string;
    score: number;
    total: number;
}

type PromptStage = 'ask' | 'form' | 'saved' | 'declined';

const emptyValues = {first_name: '', last_name: '', email: ''};

export const SaveScorePrompt: React.FC<SaveScorePromptProps> = ({organizerId, ageBand, score, total}) => {
    const {data: user, isLoading: isLoadingUser} = useGetMe();
    const mutation = useSubmitQuizResult(organizerId);
    const [stage, setStage] = useState<PromptStage>('ask');
    const [values, setValues] = useState(emptyValues);
    const [error, setError] = useState<string | null>(null);
    const autoSaved = useRef(false);

    const save = (details: typeof emptyValues, onSaved: () => void) => {
        mutation.mutate(
            {...details, age_band: ageBand, score, total_questions: total},
            {
                onSuccess: onSaved,
                onError: (err: any) => showError(err?.response?.data?.message || t`Failed to save your score. Please try again.`),
            },
        );
    };

    useEffect(() => {
        if (!user || autoSaved.current) {
            return;
        }
        autoSaved.current = true;
        save(
            {first_name: user.first_name, last_name: user.last_name, email: user.email},
            () => setStage('saved'),
        );
    }, [user]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!values.first_name.trim() || !values.last_name.trim() || !values.email.trim()) {
            setError(t`Please fill in your first name, last name and email`);
            return;
        }

        setError(null);
        save(values, () => {
            showSuccess(t`Your score has been saved.`);
            setStage('saved');
        });
    };

    if (isLoadingUser || stage === 'declined') {
        return null;
    }

    if (stage === 'saved') {
        return <p className={classes.puzzleText}>{t`Your score has been saved.`}</p>;
    }

    if (user) {
        return null;
    }

    if (stage === 'ask') {
        return (
            <div className={classes.savePrompt}>
                <p className={classes.puzzleSubtitle}>{t`Would you like to save your score?`}</p>
                <div className={classes.saveActions}>
                    <button
                        type="button"
                        className={classes.primaryButton}
                        onClick={() => setStage('form')}
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
    }

    return (
        <form onSubmit={handleSubmit} className={classes.saveForm}>
            <p className={classes.puzzleText}>{t`Enter your details to sign in or sign up and save your score.`}</p>
            <input
                type="text"
                className={classes.saveInput}
                placeholder={t`First name`}
                aria-label={t`First name`}
                value={values.first_name}
                onChange={(e) => setValues({...values, first_name: e.target.value})}
            />
            <input
                type="text"
                className={classes.saveInput}
                placeholder={t`Last name`}
                aria-label={t`Last name`}
                value={values.last_name}
                onChange={(e) => setValues({...values, last_name: e.target.value})}
            />
            <input
                type="email"
                className={classes.saveInput}
                placeholder={t`Email`}
                aria-label={t`Email`}
                value={values.email}
                onChange={(e) => setValues({...values, email: e.target.value})}
            />
            {error && <p className={classes.saveError}>{error}</p>}
            <button
                type="submit"
                className={classes.primaryButton}
                disabled={mutation.isPending}
                data-testid="puzzles-save-score-submit"
            >
                {mutation.isPending && <IconLoader2 size={16}/>}
                {t`Save my score`}
            </button>
        </form>
    );
};

export default SaveScorePrompt;
