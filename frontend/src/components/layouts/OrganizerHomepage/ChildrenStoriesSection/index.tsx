import React, {useEffect, useState} from 'react';
import {t} from '@lingui/macro';
import {IconFeather} from '@tabler/icons-react';
import {Organizer, PublishedChildStorySubmission} from '../../../../types.ts';
import {useGetPublishedChildStorySubmissions} from '../../../../queries/useGetPublishedChildStorySubmissions.ts';
import {ExampleStoryCard} from '../ExampleStoryCard';
import {ExamplePoemCard} from '../ExampleStoryCard/ExamplePoemCard';
import {SubmitStoryForm} from './SubmitStoryForm';
import classes from './ChildrenStoriesSection.module.scss';

interface ChildrenStoriesSectionProps {
    organizer: Organizer;
}

const PER_PAGE = 9;

export const ChildrenStoriesSection: React.FC<ChildrenStoriesSectionProps> = ({organizer}) => {
    const [page, setPage] = useState(1);
    const [submissions, setSubmissions] = useState<PublishedChildStorySubmission[]>([]);

    const {data, isLoading} = useGetPublishedChildStorySubmissions(organizer.id, {
        pageNumber: page,
        perPage: PER_PAGE,
    });

    useEffect(() => {
        if (!data?.data) {
            return;
        }

        setSubmissions((previous) => page === 1 ? data.data : [...previous, ...data.data]);
    }, [data, page]);

    const hasMore = data?.meta ? page < data.meta.last_page : false;

    return (
        <div className={classes.wrapper}>
            <div className={classes.intro}>
                <div className={classes.introSpacer}/>
                <h1 className={classes.title}>{t`Children's Stories & Poems`}</h1>
                <p className={classes.subtitle}>
                    {t`A collection of original stories and poems written by children in our community.`}
                </p>
            </div>

            <SubmitStoryForm organizer={organizer}/>

            {isLoading && page === 1 && <p className={classes.empty}>{t`Loading...`}</p>}

            {!isLoading && submissions.length === 0 && (
                <p className={classes.empty}>
                    {t`No stories have been published yet — check back soon!`}
                </p>
            )}

            <div className={classes.grid}>
                {submissions.map((submission) => (
                    <article key={submission.id} className={classes.card}>
                        <div className={classes.cardHeader}>
                            <span className={classes.typeBadge}>
                                <IconFeather size={13}/>
                                {submission.type === 'POEM' ? t`Poem` : t`Story`}
                            </span>
                        </div>
                        <p className={classes.author}>
                            {submission.first_name} {submission.last_initial}. · {submission.year_group} · {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                        <p className={classes.content}>{submission.content}</p>
                    </article>
                ))}
            </div>

            {hasMore && (
                <button
                    type="button"
                    className={classes.loadMore}
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isLoading}
                >
                    {t`Load more`}
                </button>
            )}

            <section className={classes.examples}>
                <h2 className={classes.examplesHeading}>{t`Need some inspiration?`}</h2>
                <div className={classes.examplesGrid}>
                    <ExampleStoryCard/>
                    <ExamplePoemCard/>
                </div>
            </section>
        </div>
    );
};

export default ChildrenStoriesSection;
