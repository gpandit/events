import React, {useState} from 'react';
import {t, Trans} from '@lingui/macro';
import {IconCheck, IconFileUpload, IconLoader2, IconSend} from '@tabler/icons-react';
import {Organizer} from '../../../../../types.ts';
import {useSubmitChildStorySubmission} from '../../../../../mutations/useSubmitChildStorySubmission.ts';
import {showError} from '../../../../../utilites/notifications.tsx';
import classes from '../ResourcesForChildren.module.scss';

interface StorySubmissionTabProps {
    organizer: Organizer;
}

const MAX_FILE_SIZE_BYTES = 200 * 1024;

export const StorySubmissionTab: React.FC<StorySubmissionTabProps> = ({organizer}) => {
    const submitMutation = useSubmitChildStorySubmission(organizer.id);
    const [submitted, setSubmitted] = useState(false);
    const [type, setType] = useState<'STORY' | 'POEM'>('STORY');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [yearGroup, setYearGroup] = useState('');
    const [content, setContent] = useState('');
    const [originalFilename, setOriginalFilename] = useState<string | undefined>(undefined);
    const [consentOwnWork, setConsentOwnWork] = useState(false);
    const [consentPublish, setConsentPublish] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        if (!file.name.toLowerCase().endsWith('.txt')) {
            showError(t`Please upload a plain text (.txt) file, or paste your writing into the box below instead.`);
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            showError(t`That file is too large. Please keep it under 200KB, or paste your writing below instead.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setContent(String(reader.result ?? ''));
            setOriginalFilename(file.name);
        };
        reader.onerror = () => {
            showError(t`We couldn't read that file. Please try pasting your writing into the box below instead.`);
        };
        reader.readAsText(file);
    };

    const resetForm = () => {
        setType('STORY');
        setFirstName('');
        setLastName('');
        setYearGroup('');
        setContent('');
        setOriginalFilename(undefined);
        setConsentOwnWork(false);
        setConsentPublish(false);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!firstName || !lastName || !yearGroup || !content) {
            setError(t`Please fill in all fields before submitting.`);
            return;
        }

        if (!consentOwnWork || !consentPublish) {
            setError(t`Please confirm both boxes below before submitting.`);
            return;
        }

        setError(null);
        submitMutation.mutate({
            type,
            first_name: firstName,
            last_name: lastName,
            year_group: yearGroup,
            content,
            original_filename: originalFilename,
            consent_own_work: consentOwnWork,
            consent_publish: consentPublish,
        }, {
            onSuccess: () => {
                setSubmitted(true);
                resetForm();
            },
            onError: (err: any) => {
                showError(err?.response?.data?.message || t`Something went wrong. Please try again.`);
            },
        });
    };

    if (submitted) {
        return (
            <div className={classes.tabPanel}>
                <div className={classes.submittedBanner}>
                    <IconCheck size={32}/>
                    <h3>{t`Thank you for sharing your writing!`}</h3>
                    <p>
                        <Trans>
                            Our team will read it over, and if it's approved, it'll be published on our Children's
                            Stories page with your first name, last initial and year group.
                        </Trans>
                    </p>
                    <button
                        type="button"
                        className={classes.submitAnother}
                        onClick={() => setSubmitted(false)}
                    >
                        {t`Submit another story or poem`}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.tabPanel}>
            <p className={classes.storyIntro}>
                <Trans>
                    Share your own short story or poem with the Friends of Repton community! Each month we'll
                    award a prize for the best story and the best poem. If you'd like your work published, your
                    first name, last initial and year group will be shown alongside it.
                </Trans>
            </p>

            <form onSubmit={handleSubmit} className={classes.storyForm}>
                <div className={classes.typeToggle}>
                    <button
                        type="button"
                        className={type === 'STORY' ? classes.typeButtonActive : classes.typeButton}
                        onClick={() => setType('STORY')}
                    >
                        {t`Story`}
                    </button>
                    <button
                        type="button"
                        className={type === 'POEM' ? classes.typeButtonActive : classes.typeButton}
                        onClick={() => setType('POEM')}
                    >
                        {t`Poem`}
                    </button>
                </div>

                <div className={classes.fieldRow}>
                    <div className={classes.field}>
                        <label htmlFor="story-first-name">{t`First name`}</label>
                        <input
                            id="story-first-name"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={classes.input}
                            required
                        />
                    </div>
                    <div className={classes.field}>
                        <label htmlFor="story-last-name">{t`Last name`}</label>
                        <input
                            id="story-last-name"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={classes.input}
                            required
                        />
                    </div>
                </div>

                <div className={classes.field}>
                    <label htmlFor="story-year-group">{t`Class / Year group`}</label>
                    <input
                        id="story-year-group"
                        type="text"
                        placeholder={t`e.g. Year 5 or Form 2`}
                        value={yearGroup}
                        onChange={(e) => setYearGroup(e.target.value)}
                        className={classes.input}
                        required
                    />
                </div>

                <div className={classes.field}>
                    <div className={classes.contentLabelRow}>
                        <label htmlFor="story-content">{t`Your story or poem`}</label>
                        <label className={classes.fileUploadLabel}>
                            <IconFileUpload size={15}/> {t`Upload a .txt file`}
                            <input type="file" accept=".txt" onChange={handleFileChange} hidden/>
                        </label>
                    </div>
                    <textarea
                        id="story-content"
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            setOriginalFilename(undefined);
                        }}
                        className={classes.textarea}
                        rows={8}
                        required
                    />
                </div>

                <label className={classes.consentRow}>
                    <input
                        type="checkbox"
                        checked={consentOwnWork}
                        onChange={(e) => setConsentOwnWork(e.target.checked)}
                    />
                    <span className={classes.consentTextLarge}>
                        {t`I confirm this is entirely my own original work.`}
                    </span>
                </label>

                <label className={classes.consentRow}>
                    <input
                        type="checkbox"
                        checked={consentPublish}
                        onChange={(e) => setConsentPublish(e.target.checked)}
                    />
                    <span>
                        {t`I'd like my story/poem to be considered for publication on this website.`}
                    </span>
                </label>

                {error && <p className={classes.formError}>{error}</p>}

                <button type="submit" className={classes.storySubmit} disabled={submitMutation.isPending}>
                    {submitMutation.isPending ? <IconLoader2 size={16} className={classes.spin}/> :
                        <IconSend size={16}/>}
                    {t`Submit for review`}
                </button>
            </form>
        </div>
    );
};

export default StorySubmissionTab;
