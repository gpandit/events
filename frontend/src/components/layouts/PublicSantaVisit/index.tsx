import {FormEvent, useEffect, useState} from "react";
import {useLoaderData, useParams} from "react-router";
import {useQuery} from "@tanstack/react-query";
import {t} from "@lingui/macro";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {Event, EventOccurrence, GenericPaginatedResponse, Organizer, SlotChild} from "../../../types.ts";
import {OrganizerPageShell} from "../OrganizerHomepage/OrganizerPageShell";
import {OrganizerNotFound} from "../PublicOrganizer/OrganizerNotFound";
import {useGetEventPublic} from "../../../queries/useGetEventPublic.ts";
import {eventOccurrenceClientPublic} from "../../../api/event-occurrence.client.ts";
import {useLoginCustomer} from "../../../mutations/useLoginCustomer.ts";
import {useBookSlot} from "../../../mutations/useBookSlot.ts";
import {useJoinSlotWaitlist} from "../../../mutations/useJoinSlotWaitlist.ts";
import {formatDateWithLocale} from "../../../utilites/dates.ts";
import classes from "./PublicSantaVisit.module.scss";

dayjs.extend(utc);

const tokenStorageKey = (organizerId: string) => `slot_customer_token_${organizerId}`;

const readStoredToken = (organizerId: string): string | null => {
    try {
        return window.sessionStorage.getItem(tokenStorageKey(organizerId));
    } catch {
        return null;
    }
};

const storeToken = (organizerId: string, token: string | null) => {
    try {
        if (token) {
            window.sessionStorage.setItem(tokenStorageKey(organizerId), token);
        } else {
            window.sessionStorage.removeItem(tokenStorageKey(organizerId));
        }
    } catch {
        return;
    }
};

const errorText = (error: any): string =>
    error?.response?.data?.message
    || (Object.values(error?.response?.data?.errors ?? {}).flat()[0] as string | undefined)
    || t`Something went wrong. Please try again.`;

const SignIn = ({organizerId, onSignedIn}: { organizerId: string; onSignedIn: (token: string) => void }) => {
    const loginMutation = useLoginCustomer(organizerId);
    const [credentials, setCredentials] = useState({email: '', password: ''});
    const [error, setError] = useState<string | null>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        loginMutation.mutate(credentials, {
            onSuccess: (response) => onSignedIn(response.data.lookup_token),
            onError: (err: any) => setError(errorText(err)),
        });
    };

    return (
        <form onSubmit={submit}>
            <p className={classes.text}>{t`Please sign in to book a visit with Santa.`}</p>
            <label className={classes.field}>
                {t`Email`}
                <input
                    type="email"
                    required
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    data-testid="santa-visit-email"
                />
            </label>
            <label className={classes.field}>
                {t`Password`}
                <input
                    type="password"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    data-testid="santa-visit-password"
                />
            </label>
            {error && <p className={classes.error} role="alert">{error}</p>}
            <button
                type="submit"
                className={classes.primaryButton}
                disabled={loginMutation.isPending}
                data-testid="santa-visit-sign-in"
            >
                {t`Sign in`}
            </button>
        </form>
    );
};

const SlotPicker = ({event, token, onSignedOut}: { event: Event; token: string; onSignedOut: () => void }) => {
    const eventId = event.id as number;
    const timezone = event.timezone ?? 'UTC';
    const bookMutation = useBookSlot(eventId, token);
    const waitlistMutation = useJoinSlotWaitlist(eventId, token);
    const [selected, setSelected] = useState<EventOccurrence | null>(null);
    const [children, setChildren] = useState<SlotChild[]>([{first_name: ''}]);
    const [error, setError] = useState<string | null>(null);
    const [needsReplaceConfirmation, setNeedsReplaceConfirmation] = useState(false);
    const [result, setResult] = useState<'booked' | 'waitlisted' | null>(null);

    const {data: occurrences, isLoading} = useQuery<EventOccurrence[]>({
        queryKey: ['santaVisitSlots', eventId, result],
        queryFn: async () => {
            const from = dayjs.utc().format('YYYY-MM-DD HH:mm:ss');
            const to = dayjs.utc().add(2, 'year').format('YYYY-MM-DD HH:mm:ss');
            const {data} = await eventOccurrenceClientPublic.all(eventId, from, to);
            return data;
        },
        refetchOnWindowFocus: false,
    });

    const slots = (occurrences ?? []).filter((occurrence) => occurrence.is_active && occurrence.is_future);
    const isBookable = (slot: EventOccurrence) => (slot.available_capacity ?? 1) > 0;
    const allFull = slots.length > 0 && slots.every((slot) => !isBookable(slot));
    const maxChildren = Math.max(1, selected?.available_capacity ?? selected?.capacity ?? 1);

    const handleError = (err: any) => {
        if (err?.response?.status === 401) {
            storeToken(String(event.organizer_id), null);
            onSignedOut();
            return;
        }
        if (err?.response?.status === 409 && selected) {
            setNeedsReplaceConfirmation(true);
        }
        setError(errorText(err));
    };

    const book = (replace: boolean) => {
        if (!selected) {
            return;
        }
        setError(null);
        bookMutation.mutate({
            event_occurrence_id: selected.id as number,
            children: children.filter((child) => child.first_name.trim() !== ''),
            replace,
        }, {
            onSuccess: () => setResult('booked'),
            onError: handleError,
        });
    };

    const joinWaitlist = () => {
        setError(null);
        waitlistMutation.mutate(undefined, {
            onSuccess: () => setResult('waitlisted'),
            onError: (err: any) => setError(errorText(err)),
        });
    };

    if (result === 'booked') {
        return (
            <div className={classes.notice} data-testid="santa-visit-booked">
                <h2 className={classes.title}>{t`You're booked!`}</h2>
                <p className={classes.text}>{t`Your QR ticket has been emailed to you. Show it at the Grotto.`}</p>
            </div>
        );
    }

    if (result === 'waitlisted') {
        return (
            <div className={classes.notice} data-testid="santa-visit-waitlisted">
                <h2 className={classes.title}>{t`You're on the waitlist`}</h2>
                <p className={classes.text}>{t`If a slot opens up, we'll email you an offer.`}</p>
            </div>
        );
    }

    if (isLoading) {
        return <p className={classes.text}>{t`Loading...`}</p>;
    }

    if (allFull) {
        return (
            <>
                <p className={classes.text}>{t`All Santa visit slots are currently full.`}</p>
                {error && <p className={classes.error} role="alert">{error}</p>}
                <button
                    type="button"
                    className={classes.primaryButton}
                    disabled={waitlistMutation.isPending}
                    onClick={joinWaitlist}
                    data-testid="santa-visit-join-waitlist"
                >
                    {t`Join the waitlist`}
                </button>
            </>
        );
    }

    return (
        <>
            <p className={classes.text}>{t`Choose a time for your visit.`}</p>
            <div className={classes.slotGrid}>
                {slots.map((slot) => (
                    <button
                        key={slot.id}
                        type="button"
                        disabled={!isBookable(slot)}
                        className={`${classes.slot} ${selected?.id === slot.id ? classes.slotSelected : ''}`}
                        onClick={() => {
                            setSelected(slot);
                            setNeedsReplaceConfirmation(false);
                            setError(null);
                        }}
                        data-testid={`santa-visit-slot-${slot.id}`}
                    >
                        {formatDateWithLocale(slot.start_date, 'timeOnly', timezone)}
                    </button>
                ))}
            </div>

            {selected && (
                <>
                    {children.slice(0, maxChildren).map((child, index) => (
                        <label key={index} className={classes.field}>
                            {t`Child's name`}
                            <input
                                required={index === 0}
                                value={child.first_name}
                                onChange={(e) => setChildren(children.map((c, i) => i === index ? {...c, first_name: e.target.value} : c))}
                                data-testid={`santa-visit-child-${index}`}
                            />
                        </label>
                    ))}
                    {children.length < maxChildren && (
                        <button
                            type="button"
                            className={classes.secondaryButton}
                            onClick={() => setChildren([...children, {first_name: ''}])}
                        >
                            {t`Add another child`}
                        </button>
                    )}
                    {error && <p className={classes.error} role="alert">{error}</p>}
                    <div className={classes.actions}>
                        {needsReplaceConfirmation ? (
                            <button
                                type="button"
                                className={classes.primaryButton}
                                disabled={bookMutation.isPending}
                                onClick={() => book(true)}
                                data-testid="santa-visit-replace"
                            >
                                {t`Replace my existing booking`}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={classes.primaryButton}
                                disabled={bookMutation.isPending || children[0].first_name.trim() === ''}
                                onClick={() => book(false)}
                                data-testid="santa-visit-book"
                            >
                                {t`Book this slot`}
                            </button>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

export const PublicSantaVisit = () => {
    const loaderData = useLoaderData() as {
        organizer: Organizer | null;
        eventsData?: GenericPaginatedResponse<Event>;
        isPastEvents: boolean;
    };
    const {eventId} = useParams();
    const organizerId = String(loaderData?.organizer?.id ?? '');
    const {data: event, isLoading, isError} = useGetEventPublic(eventId);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(readStoredToken(organizerId));
    }, [organizerId]);

    if (!loaderData?.organizer) {
        return <OrganizerNotFound/>;
    }

    const signedIn = (newToken: string) => {
        storeToken(organizerId, newToken);
        setToken(newToken);
    };

    return (
        <OrganizerPageShell organizer={loaderData.organizer} activeNav="events">
            <div className={classes.wrapper}>
                {isLoading && <p className={classes.text}>{t`Loading...`}</p>}
                {isError && <p className={classes.error}>{t`This event could not be found.`}</p>}
                {event && (
                    <>
                        <h1 className={classes.title}>{event.title}</h1>
                        {token
                            ? <SlotPicker event={event} token={token} onSignedOut={() => setToken(null)}/>
                            : <SignIn organizerId={organizerId} onSignedIn={signedIn}/>}
                    </>
                )}
            </div>
        </OrganizerPageShell>
    );
};

export default PublicSantaVisit;
