import React from 'react';
import {useNavigate} from 'react-router';
import {Tabs} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconFeather, IconPalette, IconPuzzle} from '@tabler/icons-react';
import {Organizer} from '../../../../types.ts';
import {organizerResourcesPath} from '../../../../utilites/urlHelper.ts';
import {ColouringPagesTab} from './ColouringPagesTab';
import {PuzzlesTab} from './PuzzlesTab';
import {StorySubmissionTab} from './StorySubmissionTab';
import classes from './ResourcesForChildren.module.scss';

interface ResourcesForChildrenProps {
    organizer: Organizer;
    activeTab?: string;
}

const TABS = ['colouring-pages', 'puzzles', 'share-your-story'] as const;
type ResourcesTab = typeof TABS[number];

const isResourcesTab = (value?: string): value is ResourcesTab => TABS.includes(value as ResourcesTab);

export const ResourcesForChildren: React.FC<ResourcesForChildrenProps> = ({organizer, activeTab}) => {
    const navigate = useNavigate();
    const value = isResourcesTab(activeTab) ? activeTab : 'colouring-pages';

    return (
        <section className={classes.section}>
            <h2 className={classes.heading}>{t`Resources for Children`}</h2>
            <p className={classes.subheading}>
                {t`Colouring sheets, puzzles, and a place to share your own stories and poems.`}
            </p>

            <Tabs
                value={value}
                onChange={(next) => isResourcesTab(next ?? undefined) && navigate(organizerResourcesPath(organizer, next as ResourcesTab))}
                className={classes.tabs}
            >
                <Tabs.List>
                    <Tabs.Tab value="colouring-pages" leftSection={<IconPalette size={16}/>}>
                        {t`Colouring Pages`}
                    </Tabs.Tab>
                    <Tabs.Tab value="puzzles" leftSection={<IconPuzzle size={16}/>}>
                        {t`Puzzles`}
                    </Tabs.Tab>
                    <Tabs.Tab value="share-your-story" leftSection={<IconFeather size={16}/>}>
                        {t`Share Your Story`}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="colouring-pages">
                    <ColouringPagesTab/>
                </Tabs.Panel>
                <Tabs.Panel value="puzzles">
                    <PuzzlesTab/>
                </Tabs.Panel>
                <Tabs.Panel value="share-your-story">
                    <StorySubmissionTab organizer={organizer}/>
                </Tabs.Panel>
            </Tabs>
        </section>
    );
};

export default ResourcesForChildren;
