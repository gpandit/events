import {useCallback, useEffect, useState} from 'react';
import {IdParam, QuizPlayerSession} from '../../../../../types.ts';

const storageKey = (organizerId: IdParam) => `fos_quiz_player_${organizerId}`;

const readSession = (organizerId: IdParam): QuizPlayerSession | null => {
    try {
        const stored = window.localStorage.getItem(storageKey(organizerId));
        return stored ? JSON.parse(stored) as QuizPlayerSession : null;
    } catch {
        return null;
    }
};

const persistSession = (organizerId: IdParam, session: QuizPlayerSession | null) => {
    try {
        if (session) {
            window.localStorage.setItem(storageKey(organizerId), JSON.stringify(session));
        } else {
            window.localStorage.removeItem(storageKey(organizerId));
        }
    } catch {
        return;
    }
};

export const useQuizPlayerSession = (organizerId: IdParam) => {
    const [session, setSession] = useState<QuizPlayerSession | null>(null);

    useEffect(() => {
        setSession(readSession(organizerId));
    }, [organizerId]);

    const signIn = useCallback((next: QuizPlayerSession) => {
        persistSession(organizerId, next);
        setSession(next);
    }, [organizerId]);

    const signOut = useCallback(() => {
        persistSession(organizerId, null);
        setSession(null);
    }, [organizerId]);

    return {session, signIn, signOut};
};
