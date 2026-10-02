import React from 'react';
import {Tabs} from '@mantine/core';
import {t} from '@lingui/macro';
import {IconFeather, IconPalette, IconPuzzle} from '@tabler/icons-react';
import {Organizer} from '../../../../types.ts';
import {ColouringPagesTab} from './ColouringPagesTab';
import {PuzzlesTab} from './PuzzlesTab';
import {StorySubmissionTab} from './StorySubmissionTab';
import classes from './ResourcesForChildren.module.scss';

interface ResourcesForChildrenProps {
    organizer: Organizer;
}

export const ResourcesForChildren: React.FC<ResourcesForChildrenProps> = ({organizer}) => {
    return (
        <section id="resources-for-children" className={classes.section}>
            <h2 className={classes.heading}>{t`Resources for Children`}</h2>
            <p className={classes.subheading}>
                {t`Colouring sheets, puzzles, and a place to share your own stories and poems.`}
            </p>

            <Tabs defaultValue="colouring" className={classes.tabs}>
                <Tabs.List>
                    <Tabs.Tab value="colouring" leftSection={<IconPalette size={16}/>}>
                        {t`Colouring Pages`}
                    </Tabs.Tab>
                    <Tabs.Tab value="puzzles" leftSection={<IconPuzzle size={16}/>}>
                        {t`Puzzles`}
                    </Tabs.Tab>
                    <Tabs.Tab value="stories" leftSection={<IconFeather size={16}/>}>
                        {t`Share Your Story`}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="colouring">
                    <ColouringPagesTab/>
                </Tabs.Panel>
                <Tabs.Panel value="puzzles">
                    <PuzzlesTab/>
                </Tabs.Panel>
                <Tabs.Panel value="stories">
                    <StorySubmissionTab organizer={organizer}/>
                </Tabs.Panel>
            </Tabs>
        </section>
    );
};

export default ResourcesForChildren;
