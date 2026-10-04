import {useState} from "react";
import {useLoaderData, useParams} from "react-router";
import {t} from "@lingui/macro";
import {GenericPaginatedResponse, Event, Organizer, ParentalConsentDetails} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";
import {useGetParentalConsent} from "../../../queries/useGetParentalConsent.ts";
import {useRespondToParentalConsent} from "../../../mutations/useRespondToParentalConsent.ts";
import classes from "./PublicParentalConsent.module.scss";

const ConsentBody = ({details, organizerId, token}: {
    details: ParentalConsentDetails;
    organizerId: string;
    token: string;
}) => {
    const respondMutation = useRespondToParentalConsent(organizerId, token);
    const [recorded, setRecorded] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isStory = details.subject_type === 'CHILD_STORY';
    const childName = details.child_first_name;
    const organizerName = details.organizer_name;
    const lastInitial = details.child_last_initial;
    const yearGroup = details.year_group;
    const username = details.username;
    const ageBand = details.age_band;
    const workLabel = details.work_type === 'POEM' ? t`poem` : t`story`;
    const submittedOn = details.submitted_at ? new Date(details.submitted_at).toLocaleDateString() : '';

    const respond = (granted: boolean) => {
        setError(null);
        respondMutation.mutate(granted, {
            onSuccess: () => setRecorded(granted),
            onError: (err: any) => setError(
                err?.response?.data?.errors?.granted?.[0]
                || err?.response?.data?.message
                || t`Something went wrong. Please try again.`
            ),
        });
    };

    if (recorded !== null || details.status !== 'PENDING') {
        const granted = recorded ?? details.status === 'GRANTED';
        return (
            <>
                <h1 className={classes.title}>{t`Thank you`}</h1>
                <p className={classes.text} data-testid="parental-consent-result">
                    {granted
                        ? (isStory
                            ? t`Your permission has been recorded. If our team approves the work, it will be published.`
                            : t`Your permission has been recorded. ${childName} can now appear on the leaderboard.`)
                        : t`Your response has been recorded. Nothing will be published or shared.`}
                </p>
            </>
        );
    }

    if (details.is_expired) {
        return (
            <>
                <h1 className={classes.title}>{t`This link has expired`}</h1>
                <p className={classes.text}>
                    {t`Please ask ${childName} to submit again so we can send you a new request.`}
                </p>
            </>
        );
    }

    return (
        <>
            <h1 className={classes.title}>{t`Your permission is needed`}</h1>
            {isStory ? (
                <>
                    <p className={classes.text}>
                        {t`${childName} has submitted a ${workLabel} to ${organizerName} and would like it published on our public website.`}
                    </p>
                    <p className={classes.text}>{t`If you agree and our team approves it, the following will be shown below its headline:`}</p>
                    <ul className={classes.list}>
                        <li>{t`First name and last initial: ${childName} ${lastInitial}.`}</li>
                        <li>{t`Class / year group: ${yearGroup}`}</li>
                        <li>{t`Date submitted: ${submittedOn}`}</li>
                        <li>{t`The full text of the work, shown below`}</li>
                    </ul>
                    <div className={classes.work}>{details.content}</div>
                </>
            ) : (
                <>
                    <p className={classes.text}>
                        {t`${childName} has created a puzzles account with ${organizerName} (age group ${ageBand}).`}
                    </p>
                    <p className={classes.text}>{t`If you agree, the public leaderboard will show only:`}</p>
                    <ul className={classes.list}>
                        <li>{t`The auto-generated username ${username} (never their real name)`}</li>
                        <li>{t`Their points, number of tests taken and best score`}</li>
                    </ul>
                    <p className={classes.text}>
                        {t`Without your permission they can still play and save their scores, but will not appear on the leaderboard.`}
                    </p>
                </>
            )}
            {error && <p className={classes.error} role="alert">{error}</p>}
            <div className={classes.actions}>
                <button
                    type="button"
                    className={classes.primaryButton}
                    disabled={respondMutation.isPending}
                    onClick={() => respond(true)}
                    data-testid="parental-consent-grant"
                >
                    {t`I give permission`}
                </button>
                <button
                    type="button"
                    className={classes.secondaryButton}
                    disabled={respondMutation.isPending}
                    onClick={() => respond(false)}
                    data-testid="parental-consent-decline"
                >
                    {t`I do not give permission`}
                </button>
            </div>
        </>
    );
};

export const PublicParentalConsent = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData?: GenericPaginatedResponse<Event>;
        isPastEvents: boolean;
    };
    const {organizerId, token} = useParams();
    const {data: details, isLoading, isError} = useGetParentalConsent(organizerId as string, token as string);

    if (!loaderData?.organizer) {
        return <OrganizerNotFound/>;
    }

    return (
        <OrganizerPageShell organizer={loaderData.organizer} activeNav="stories">
            <div className={classes.wrapper}>
                {isLoading && <p className={classes.text}>{t`Loading...`}</p>}
                {isError && (
                    <>
                        <h1 className={classes.title}>{t`This link is not valid`}</h1>
                        <p className={classes.text}>{t`Please check the link in the email we sent you.`}</p>
                    </>
                )}
                {details && <ConsentBody details={details} organizerId={organizerId as string} token={token as string}/>}
            </div>
        </OrganizerPageShell>
    );
};

export default PublicParentalConsent;
