import React, {useState} from 'react';
import {t} from "@lingui/macro";
import {IconLoader2, IconSend} from "@tabler/icons-react";
import {useSubmitVolunteerSignup} from "../../../../mutations/useSubmitVolunteerSignup.ts";
import {showError, showSuccess} from "../../../../utilites/notifications.tsx";
import classes from './VolunteerForm.module.scss';

const emptyValues = {first_name: '', last_name: '', email: '', phone: '', message: ''};
type Topic = 'volunteer' | 'sponsorship' | 'general';

export const VolunteerForm: React.FC = () => {
    const mutation = useSubmitVolunteerSignup();
    const [values, setValues] = useState(emptyValues);
    const [topic, setTopic] = useState<Topic>('volunteer');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!values.first_name || !values.last_name || !values.email || !values.phone) {
            setError(t`Please fill in your name, email and phone number`);
            return;
        }

        setError(null);
        const topicLabels: Record<Topic, string> = {
            volunteer: t`Volunteering`,
            sponsorship: t`Sponsorship`,
            general: t`General enquiry`,
        };
        mutation.mutate({...values, message: `[${topicLabels[topic]}] ${values.message}`.trim()}, {
            onSuccess: () => {
                showSuccess(t`Thank you for getting in touch! We'll reply soon.`);
                setValues(emptyValues);
            },
            onError: (err: any) => {
                showError(err?.response?.data?.message || t`Failed to send your message. Please try again.`);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className={classes.form}>
            <select
                aria-label={t`I'm interested in`}
                value={topic}
                onChange={(e) => setTopic(e.target.value as Topic)}
                className={classes.input}
                data-testid="volunteer-form-topic"
            >
                <option value="volunteer">{t`Volunteering`}</option>
                <option value="sponsorship">{t`Sponsorship`}</option>
                <option value="general">{t`General enquiry`}</option>
            </select>
            <div className={classes.row}>
                <input
                    type="text"
                    placeholder={t`First name`}
                    aria-label={t`First name`}
                    value={values.first_name}
                    onChange={(e) => setValues({...values, first_name: e.target.value})}
                    className={classes.input}
                />
                <input
                    type="text"
                    placeholder={t`Last name`}
                    aria-label={t`Last name`}
                    value={values.last_name}
                    onChange={(e) => setValues({...values, last_name: e.target.value})}
                    className={classes.input}
                />
            </div>
            <div className={classes.row}>
                <input
                    type="email"
                    placeholder={t`Email`}
                    aria-label={t`Email`}
                    value={values.email}
                    onChange={(e) => setValues({...values, email: e.target.value})}
                    className={classes.input}
                />
                <input
                    type="tel"
                    placeholder={t`Phone number`}
                    aria-label={t`Phone number`}
                    value={values.phone}
                    onChange={(e) => setValues({...values, phone: e.target.value})}
                    className={classes.input}
                />
            </div>
            <textarea
                placeholder={t`Tell us how you'd like to help or what you'd like to know`}
                aria-label={t`Message`}
                value={values.message}
                onChange={(e) => setValues({...values, message: e.target.value})}
                className={classes.textarea}
                rows={4}
            />
            {error && <p className={classes.error}>{error}</p>}
            <button type="submit" className={classes.submit} disabled={mutation.isPending}>
                {mutation.isPending ? <IconLoader2 size={16}/> : <IconSend size={16}/>}
                {t`Send`}
            </button>
        </form>
    );
};

export default VolunteerForm;
