import React from 'react';
import {t} from '@lingui/macro';
import {IdParam} from '../../../../types.ts';
import {ColouringPagesTab} from './ColouringPagesTab';
import classes from './ResourcesForChildren.module.scss';

interface ResourcesForChildrenProps {
    organizerId: IdParam;
}

export const ResourcesForChildren: React.FC<ResourcesForChildrenProps> = ({organizerId}) => (
    <section className={classes.section}>
        <h2 className={classes.heading}>{t`Creative Corner`}</h2>
        <p className={classes.subheading}>
            {t`Colouring sheets for children.`}
        </p>

        <div className={classes.tabPanel}>
            <ColouringPagesTab organizerId={organizerId}/>
        </div>
    </section>
);

export default ResourcesForChildren;
