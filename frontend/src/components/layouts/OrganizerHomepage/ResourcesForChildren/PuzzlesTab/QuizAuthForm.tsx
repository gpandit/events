import React, {useState} from 'react';
import {t, Trans} from '@lingui/macro';
import {IconLoader2} from '@tabler/icons-react';
import {IdParam, QuizPlayerSession} from '../../../../../types.ts';
import {useRegisterQuizPlayer} from '../../../../../mutations/useRegisterQuizPlayer.ts';
import {useLoginQuizPlayer} from '../../../../../mutations/useLoginQuizPlayer.ts';
import {useRequestQuizPasswordReset} from '../../../../../mutations/useRequestQuizPasswordReset.ts';
import {useRequestQuizUsernameReminder} from '../../../../../mutations/useRequestQuizUsernameReminder.ts';
import {useGetQuizUsernameOptions} from '../../../../../queries/useGetQuizUsernameOptions.ts';
import {QuizUsernamePicker} from './QuizUsernamePicker.tsx';
import {AGE_BANDS} from './generalKnowledgePuzzles.ts';
import {ageBandLabel} from './quizLabels.ts';
import classes from '../ResourcesForChildren.module.scss';

interface QuizAuthFormProps {
    organizerId: IdParam;
    onAuthenticated: (session: QuizPlayerSession) => void;
}

type AuthMode = 'signup' | 'signin' | 'forgot';

const emptySignUp = {username: '', first_name: '', email: '', age_band: '', password: ''};
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const emptySignIn = {username: '', password: ''};

const errorMessage = (error: any): string => {
    const validationErrors = error?.response?.data?.errors;
    const firstValidationError = validationErrors ? Object.values(validationErrors).flat()[0] : null;

    return (firstValidationError as string | undefined)
        || error?.response?.data?.message
        || t`Something went wrong. Please try again.`;
};

export const QuizAuthForm: React.FC<QuizAuthFormProps> = ({organizerId, onAuthenticated}) => {
    const [mode, setMode] = useState<AuthMode>('signup');
    const [signUp, setSignUp] = useState(emptySignUp);
    const [signIn, setSignIn] = useState(emptySignIn);
    const [error, setError] = useState<string | null>(null);
    const [newPlayer, setNewPlayer] = useState<QuizPlayerSession | null>(null);
    const usernameOptions = useGetQuizUsernameOptions(organizerId);
    const registerMutation = useRegisterQuizPlayer(organizerId);
    const loginMutation = useLoginQuizPlayer(organizerId);
    const resetMutation = useRequestQuizPasswordReset(organizerId);
    const reminderMutation = useRequestQuizUsernameReminder(organizerId);
    const [emailRegistered, setEmailRegistered] = useState(false);
    const [reminderSent, setReminderSent] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const isPending = registerMutation.isPending || loginMutation.isPending || resetMutation.isPending;

    const switchMode = (next: AuthMode) => {
        setMode(next);
        setError(null);
        setResetSent(false);
        setEmailRegistered(false);
        setReminderSent(false);
    };

    const handleSignUp = (event: React.FormEvent) => {
        event.preventDefault();

        if (!signUp.first_name.trim() || !signUp.password) {
            setError(t`Please fill in your first name and password`);
            return;
        }

        if (!EMAIL_PATTERN.test(signUp.email.trim())) {
            setError(t`Please enter your email address`);
            return;
        }

        if (!signUp.age_band) {
            setError(t`Please choose your age group`);
            return;
        }

        if (!signUp.username) {
            setError(t`Please pick a username`);
            return;
        }

        setError(null);
        setEmailRegistered(false);
        setReminderSent(false);
        registerMutation.mutate({
            username: signUp.username,
            first_name: signUp.first_name,
            email: signUp.email.trim(),
            age_band: signUp.age_band,
            password: signUp.password,
        }, {
            onSuccess: (response) => setNewPlayer(response.data),
            onError: (err: any) => {
                if (err?.response?.data?.errors?.email) {
                    setError(null);
                    setEmailRegistered(true);
                    return;
                }

                setError(errorMessage(err));

                if (err?.response?.data?.errors?.username) {
                    setSignUp({...signUp, username: ''});
                    usernameOptions.refetch();
                }
            },
        });
    };

    const handleReminder = () => {
        reminderMutation.mutate(signUp.email.trim(), {
            onSuccess: () => setReminderSent(true),
            onError: (err) => setError(errorMessage(err)),
        });
    };

    const handleSignIn = (event: React.FormEvent) => {
        event.preventDefault();

        if (!signIn.username.trim() || !signIn.password) {
            setError(t`Please enter your username and password`);
            return;
        }

        setError(null);
        loginMutation.mutate(signIn, {
            onSuccess: (response) => onAuthenticated(response.data),
            onError: (err) => setError(errorMessage(err)),
        });
    };

    const handleForgot = (event: React.FormEvent) => {
        event.preventDefault();

        if (!signIn.username.trim()) {
            setError(t`Please enter your username`);
            return;
        }

        setError(null);
        resetMutation.mutate(signIn.username, {
            onSuccess: () => setResetSent(true),
            onError: (err) => setError(errorMessage(err)),
        });
    };

    if (newPlayer) {
        return (
            <div className={classes.saveForm}>
                <p className={classes.puzzleSubtitle}>{t`Welcome aboard!`}</p>
                <p className={classes.puzzleText}>{t`Your username is`}</p>
                <p className={classes.usernameReveal} data-testid="puzzles-new-username">{newPlayer.username}</p>
                <p className={classes.puzzleText}>
                    {t`Write it down! You will need it to sign in next time. Only this username is shown on the leaderboard, so your real name stays private.`}
                </p>
                <button
                    type="button"
                    className={classes.primaryButton}
                    onClick={() => onAuthenticated(newPlayer)}
                    data-testid="puzzles-auth-continue"
                >
                    {t`Continue`}
                </button>
            </div>
        );
    }

    return (
        <div className={classes.saveForm}>
            {mode !== 'forgot' && (
            <div className={classes.segmented} role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'signup'}
                    className={mode === 'signup' ? classes.segmentActive : classes.segment}
                    onClick={() => switchMode('signup')}
                    data-testid="puzzles-auth-signup-tab"
                >
                    {t`Sign up`}
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'signin'}
                    className={mode === 'signin' ? classes.segmentActive : classes.segment}
                    onClick={() => switchMode('signin')}
                    data-testid="puzzles-auth-signin-tab"
                >
                    {t`Sign in`}
                </button>
            </div>
            )}

            {mode === 'signup' ? (
                <form onSubmit={handleSignUp} className={classes.saveForm}>
                    <p className={classes.puzzleText}>
                        {t`Create a login to save your scores and earn points. You will pick a fun character username so your name stays private.`}
                    </p>
                    <input
                        type="text"
                        className={classes.saveInput}
                        placeholder={t`First name`}
                        aria-label={t`First name`}
                        autoComplete="given-name"
                        value={signUp.first_name}
                        onChange={(e) => setSignUp({...signUp, first_name: e.target.value})}
                    />
                    <input
                        type="email"
                        className={classes.saveInput}
                        placeholder={t`Email`}
                        aria-label={t`Email`}
                        autoComplete="email"
                        value={signUp.email}
                        onChange={(e) => {
                            setSignUp({...signUp, email: e.target.value});
                            setEmailRegistered(false);
                            setReminderSent(false);
                        }}
                        data-testid="puzzles-signup-email"
                    />
                    {emailRegistered && (
                        <p className={classes.saveError} role="alert" data-testid="puzzles-email-registered">
                            {reminderSent ? (
                                t`If that email address is registered, we have emailed the username to it.`
                            ) : (
                                <Trans>
                                    This email is already registered. You can{' '}
                                    <button
                                        type="button"
                                        className={classes.linkButton}
                                        onClick={handleReminder}
                                        disabled={reminderMutation.isPending}
                                        data-testid="puzzles-request-username"
                                    >
                                        request your username
                                    </button>{' '}
                                    and we will email it to you.
                                </Trans>
                            )}
                        </p>
                    )}
                    <p className={classes.fieldHint}>
                        {t`We use your email to save your session and to send you a link to reset your password.`}
                    </p>
                    <p className={classes.puzzleText}>{t`Choose your age group`}</p>
                    <div className={classes.ageOptions} role="radiogroup" aria-label={t`Choose your age group`}>
                        {AGE_BANDS.map((band) => (
                            <button
                                key={band}
                                type="button"
                                role="radio"
                                aria-checked={signUp.age_band === band}
                                className={signUp.age_band === band ? classes.ageOptionActive : classes.ageOption}
                                onClick={() => setSignUp({...signUp, age_band: band})}
                                data-testid={`puzzles-signup-age-${band}`}
                            >
                                {ageBandLabel(band)}
                            </button>
                        ))}
                    </div>
                    <QuizUsernamePicker
                        options={usernameOptions.data}
                        isLoading={usernameOptions.isLoading}
                        isError={usernameOptions.isError}
                        value={signUp.username}
                        onChange={(username) => setSignUp({...signUp, username})}
                        onRetry={() => usernameOptions.refetch()}
                    />
                    <input
                        type="password"
                        className={classes.saveInput}
                        placeholder={t`Choose a password (at least 6 characters)`}
                        aria-label={t`Password`}
                        autoComplete="new-password"
                        value={signUp.password}
                        onChange={(e) => setSignUp({...signUp, password: e.target.value})}
                    />
                    {error && <p className={classes.saveError} role="alert">{error}</p>}
                    <button
                        type="submit"
                        className={classes.primaryButton}
                        disabled={isPending}
                        data-testid="puzzles-auth-signup-submit"
                    >
                        {isPending && <IconLoader2 size={16}/>}
                        {t`Create my login`}
                    </button>
                </form>
            ) : mode === 'forgot' ? (
                <form onSubmit={handleForgot} className={classes.saveForm}>
                    <p className={classes.puzzleSubtitle}>{t`Reset your password`}</p>
                    {resetSent ? (
                        <p className={classes.puzzleText} role="status" data-testid="puzzles-reset-sent">
                            {t`If that username has an email address saved, we have sent a link to reset the password. The link works for 60 minutes.`}
                        </p>
                    ) : (
                        <>
                            <p className={classes.puzzleText}>
                                {t`Enter your username and we will email a reset link to the address saved on your account. If you did not add an email when you signed up, ask a parent or guardian to contact us.`}
                            </p>
                            <input
                                type="text"
                                className={classes.saveInput}
                                placeholder={t`Username (e.g. Simba42)`}
                                aria-label={t`Username`}
                                autoCapitalize="none"
                                value={signIn.username}
                                onChange={(e) => setSignIn({...signIn, username: e.target.value})}
                            />
                            {error && <p className={classes.saveError} role="alert">{error}</p>}
                            <button
                                type="submit"
                                className={classes.primaryButton}
                                disabled={isPending}
                                data-testid="puzzles-forgot-submit"
                            >
                                {isPending && <IconLoader2 size={16}/>}
                                {t`Email me a reset link`}
                            </button>
                        </>
                    )}
                    <button type="button" className={classes.linkButton} onClick={() => switchMode('signin')}>
                        {t`Back to sign in`}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleSignIn} className={classes.saveForm}>
                    <p className={classes.puzzleText}>{t`Welcome back! Enter your username and password.`}</p>
                    <input
                        type="text"
                        className={classes.saveInput}
                        placeholder={t`Username (e.g. Simba42)`}
                        aria-label={t`Username`}
                        autoComplete="username"
                        autoCapitalize="none"
                        value={signIn.username}
                        onChange={(e) => setSignIn({...signIn, username: e.target.value})}
                    />
                    <input
                        type="password"
                        className={classes.saveInput}
                        placeholder={t`Password`}
                        aria-label={t`Password`}
                        autoComplete="current-password"
                        value={signIn.password}
                        onChange={(e) => setSignIn({...signIn, password: e.target.value})}
                    />
                    {error && <p className={classes.saveError} role="alert">{error}</p>}
                    <button
                        type="submit"
                        className={classes.primaryButton}
                        disabled={isPending}
                        data-testid="puzzles-auth-signin-submit"
                    >
                        {isPending && <IconLoader2 size={16}/>}
                        {t`Sign in`}
                    </button>
                    <button
                        type="button"
                        className={classes.linkButton}
                        onClick={() => switchMode('forgot')}
                        data-testid="puzzles-forgot-link"
                    >
                        {t`Forgot your password?`}
                    </button>
                </form>
            )}
        </div>
    );
};

export default QuizAuthForm;
