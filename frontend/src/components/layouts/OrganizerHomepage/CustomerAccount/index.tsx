import React, {useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {useMutation} from '@tanstack/react-query';
import {t} from '@lingui/macro';
import {IconLoader2, IconTicket} from '@tabler/icons-react';
import {Account, IdParam, LoginData, Organizer} from '../../../../types.ts';
import {authClient} from '../../../../api/auth.client.ts';
import {redirectToPreviousUrl} from '../../../../api/client.ts';
import {ChooseAccountModal} from '../../../modals/ChooseAccountModal';
import {useRegisterCustomer} from '../../../../mutations/useRegisterCustomer.ts';
import {useLoginCustomer} from '../../../../mutations/useLoginCustomer.ts';
import {useRequestCustomerPasswordSetup} from '../../../../mutations/useRequestCustomerPasswordSetup.ts';
import {useSetCustomerPassword} from '../../../../mutations/useSetCustomerPassword.ts';
import classes from '../ResourcesForChildren/ResourcesForChildren.module.scss';

interface CustomerAccountProps {
    organizer: Organizer;
}

type AccountMode = 'signin' | 'signup' | 'forgot';

const MIN_PASSWORD_LENGTH = 8;

const errorMessage = (error: any): string => {
    const validationErrors = error?.response?.data?.errors;
    const firstValidationError = validationErrors ? Object.values(validationErrors).flat()[0] : null;

    return (firstValidationError as string | undefined)
        || error?.response?.data?.message
        || t`Something went wrong. Please try again.`;
};

export const CustomerAccount: React.FC<CustomerAccountProps> = ({organizer}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const setupToken = searchParams.get('token');
    const [mode, setMode] = useState<AccountMode>('signin');
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [signIn, setSignIn] = useState({email: '', password: ''});
    const [signUp, setSignUp] = useState({first_name: '', last_name: '', email: '', phone: ''});
    const [newPassword, setNewPassword] = useState('');
    const loginMutation = useLoginCustomer(organizer.id);
    const registerMutation = useRegisterCustomer(organizer.id);
    const forgotMutation = useRequestCustomerPasswordSetup(organizer.id);
    const setPasswordMutation = useSetCustomerPassword(organizer.id);
    const staffLoginMutation = useMutation({mutationFn: (credentials: LoginData) => authClient.login(credentials)});
    const [staffAccounts, setStaffAccounts] = useState<Account[]>([]);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isRequestingReset, setIsRequestingReset] = useState(false);
    const isPending = isSigningIn || isRequestingReset || registerMutation.isPending || setPasswordMutation.isPending;

    const goToPurchases = (lookupToken: string) => navigate(`/my-tickets/${lookupToken}`);

    const switchMode = (next: AccountMode) => {
        setMode(next);
        setError(null);
        setNotice(null);
    };

    const signInAsStaff = async (accountId?: IdParam): Promise<boolean> => {
        try {
            const response = await staffLoginMutation.mutateAsync({
                email: signIn.email,
                password: signIn.password,
                account_id: accountId ?? '',
            });

            if (response.token) {
                redirectToPreviousUrl();
                return true;
            }

            if (response.accounts.length > 1) {
                setStaffAccounts(response.accounts);
                return true;
            }

            return false;
        } catch {
            return false;
        }
    };

    const signInAsParent = () => loginMutation.mutate(signIn, {
        onSuccess: (response) => goToPurchases(response.data.lookup_token),
        onError: (err) => setError(errorMessage(err)),
    });

    const handleSignIn = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!signIn.email.trim() || !signIn.password) {
            setError(t`Please enter your email and password`);
            return;
        }

        setError(null);
        setIsSigningIn(true);
        const isStaff = await signInAsStaff();
        setIsSigningIn(false);

        if (!isStaff) {
            signInAsParent();
        }
    };

    const handleSignUp = (event: React.FormEvent) => {
        event.preventDefault();

        if (!signUp.first_name.trim() || !signUp.last_name.trim() || !signUp.email.trim()) {
            setError(t`Please fill in your first name, last name and email`);
            return;
        }

        setError(null);
        registerMutation.mutate({...signUp, phone: signUp.phone.trim() || undefined}, {
            onSuccess: (response) => setNotice(response.message),
            onError: (err) => setError(errorMessage(err)),
        });
    };

    const handleForgot = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!signIn.email.trim()) {
            setError(t`Please enter your email`);
            return;
        }

        setError(null);
        setIsRequestingReset(true);
        await Promise.allSettled([
            authClient.forgotPassword({email: signIn.email}),
            forgotMutation.mutateAsync(signIn.email),
        ]);
        setIsRequestingReset(false);
        setNotice(t`If an account exists for that email, we have sent a link to reset the password.`);
    };

    const handleSetPassword = (event: React.FormEvent) => {
        event.preventDefault();

        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            setError(t`Your password needs at least ${MIN_PASSWORD_LENGTH} characters`);
            return;
        }

        setError(null);
        setPasswordMutation.mutate({token: setupToken as string, password: newPassword}, {
            onSuccess: (response) => goToPurchases(response.data.lookup_token),
            onError: (err) => setError(errorMessage(err)),
        });
    };

    const submitLabel = (label: string) => (
        <>
            {isPending && <IconLoader2 size={16}/>}
            {label}
        </>
    );

    return (
        <section className={classes.section}>
            <h2 className={classes.heading}>{t`My Account`}</h2>
            <p className={classes.subheading}>
                {t`Sign in to manage your events, or to see your tickets and other purchases.`}
            </p>

            <div className={classes.tabPanel}>
                <div className={classes.puzzleCard}>
                    <IconTicket size={40} className={classes.puzzleIcon}/>

                    {setupToken ? (
                        <form onSubmit={handleSetPassword} className={classes.saveForm}>
                            <h3 className={classes.puzzleTitle}>{t`Choose your password`}</h3>
                            <input
                                type="password"
                                className={classes.saveInput}
                                placeholder={t`New password (at least ${MIN_PASSWORD_LENGTH} characters)`}
                                aria-label={t`New password`}
                                autoComplete="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            {error && <p className={classes.saveError} role="alert">{error}</p>}
                            <button
                                type="submit"
                                className={classes.primaryButton}
                                disabled={isPending}
                                data-testid="account-set-password-submit"
                            >
                                {submitLabel(t`Save password and view my purchases`)}
                            </button>
                        </form>
                    ) : notice ? (
                        <div className={classes.saveForm}>
                            <p className={classes.puzzleText} role="status" data-testid="account-notice">{notice}</p>
                            <button type="button" className={classes.linkButton} onClick={() => switchMode('signin')}>
                                {t`Back to sign in`}
                            </button>
                        </div>
                    ) : (
                        <div className={classes.saveForm}>
                            {mode !== 'forgot' && (
                                <div className={classes.segmented} role="tablist">
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={mode === 'signin'}
                                        className={mode === 'signin' ? classes.segmentActive : classes.segment}
                                        onClick={() => switchMode('signin')}
                                        data-testid="account-signin-tab"
                                    >
                                        {t`Sign in`}
                                    </button>
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={mode === 'signup'}
                                        className={mode === 'signup' ? classes.segmentActive : classes.segment}
                                        onClick={() => switchMode('signup')}
                                        data-testid="account-signup-tab"
                                    >
                                        {t`Create account`}
                                    </button>
                                </div>
                            )}

                            {mode === 'signin' && (
                                <form onSubmit={handleSignIn} className={classes.saveForm}>
                                    <input
                                        type="email"
                                        className={classes.saveInput}
                                        placeholder={t`Email`}
                                        aria-label={t`Email`}
                                        autoComplete="email"
                                        value={signIn.email}
                                        onChange={(e) => setSignIn({...signIn, email: e.target.value})}
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
                                        data-testid="account-signin-submit"
                                    >
                                        {submitLabel(t`Sign in`)}
                                    </button>
                                    <button
                                        type="button"
                                        className={classes.linkButton}
                                        onClick={() => switchMode('forgot')}
                                        data-testid="account-forgot-link"
                                    >
                                        {t`Forgot your password?`}
                                    </button>
                                </form>
                            )}

                            {mode === 'signup' && (
                                <form onSubmit={handleSignUp} className={classes.saveForm}>
                                    <p className={classes.puzzleText}>
                                        {t`Create an account to see your tickets and purchases. Enter your details and we will email you a link to choose a password. If you have bought tickets with this email before, they will appear in your account.`}
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
                                        type="tel"
                                        className={classes.saveInput}
                                        placeholder={t`Phone number (optional)`}
                                        aria-label={t`Phone number`}
                                        autoComplete="tel"
                                        value={signUp.phone}
                                        onChange={(e) => setSignUp({...signUp, phone: e.target.value})}
                                    />
                                    {error && <p className={classes.saveError} role="alert">{error}</p>}
                                    <button
                                        type="submit"
                                        className={classes.primaryButton}
                                        disabled={isPending}
                                        data-testid="account-signup-submit"
                                    >
                                        {submitLabel(t`Email me a link`)}
                                    </button>
                                </form>
                            )}

                            {mode === 'forgot' && (
                                <form onSubmit={handleForgot} className={classes.saveForm}>
                                    <p className={classes.puzzleSubtitle}>{t`Reset your password`}</p>
                                    <p className={classes.puzzleText}>
                                        {t`Enter your email and we will send you a link to choose a new password.`}
                                    </p>
                                    <input
                                        type="email"
                                        className={classes.saveInput}
                                        placeholder={t`Email`}
                                        aria-label={t`Email`}
                                        autoComplete="email"
                                        value={signIn.email}
                                        onChange={(e) => setSignIn({...signIn, email: e.target.value})}
                                    />
                                    {error && <p className={classes.saveError} role="alert">{error}</p>}
                                    <button
                                        type="submit"
                                        className={classes.primaryButton}
                                        disabled={isPending}
                                        data-testid="account-forgot-submit"
                                    >
                                        {submitLabel(t`Email me a reset link`)}
                                    </button>
                                    <button type="button" className={classes.linkButton} onClick={() => switchMode('signin')}>
                                        {t`Back to sign in`}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {staffAccounts.length > 0 && (
                <ChooseAccountModal
                    accounts={staffAccounts}
                    onAccountChosen={(accountId) => signInAsStaff(accountId)}
                />
            )}
        </section>
    );
};

export default CustomerAccount;
