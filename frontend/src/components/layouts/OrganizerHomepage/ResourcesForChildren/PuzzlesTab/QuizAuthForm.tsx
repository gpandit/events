import React, {useState} from 'react';
import {t} from '@lingui/macro';
import {IconLoader2} from '@tabler/icons-react';
import {IdParam, QuizPlayerSession} from '../../../../../types.ts';
import {useRegisterQuizPlayer} from '../../../../../mutations/useRegisterQuizPlayer.ts';
import {useLoginQuizPlayer} from '../../../../../mutations/useLoginQuizPlayer.ts';
import classes from '../ResourcesForChildren.module.scss';

interface QuizAuthFormProps {
    organizerId: IdParam;
    onAuthenticated: (session: QuizPlayerSession) => void;
}

type AuthMode = 'signup' | 'signin';

const emptySignUp = {first_name: '', last_name: '', email: '', password: ''};
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
    const registerMutation = useRegisterQuizPlayer(organizerId);
    const loginMutation = useLoginQuizPlayer(organizerId);
    const isPending = registerMutation.isPending || loginMutation.isPending;

    const switchMode = (next: AuthMode) => {
        setMode(next);
        setError(null);
    };

    const handleSignUp = (event: React.FormEvent) => {
        event.preventDefault();

        if (Object.values(signUp).some((value) => !value.trim())) {
            setError(t`Please fill in all the fields`);
            return;
        }

        setError(null);
        registerMutation.mutate(signUp, {
            onSuccess: (response) => setNewPlayer(response.data),
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

            {mode === 'signup' ? (
                <form onSubmit={handleSignUp} className={classes.saveForm}>
                    <p className={classes.puzzleText}>
                        {t`Create a login to save your scores and earn points. We will give you a fun character username so your name stays private.`}
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
                        type="text"
                        className={classes.saveInput}
                        placeholder={t`Last name`}
                        aria-label={t`Last name`}
                        autoComplete="family-name"
                        value={signUp.last_name}
                        onChange={(e) => setSignUp({...signUp, last_name: e.target.value})}
                    />
                    <input
                        type="email"
                        className={classes.saveInput}
                        placeholder={t`Email`}
                        aria-label={t`Email`}
                        autoComplete="email"
                        value={signUp.email}
                        onChange={(e) => setSignUp({...signUp, email: e.target.value})}
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
                </form>
            )}
        </div>
    );
};

export default QuizAuthForm;
