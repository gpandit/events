import React from 'react';
import {t} from '@lingui/macro';
import {ColouringPagesTab} from './ColouringPagesTab';
import classes from './ResourcesForChildren.module.scss';

export const ResourcesForChildren: React.FC = () => (
    <section className={classes.section}>
        <h2 className={classes.heading}>{t`Creative Corner`}</h2>
        <p className={classes.subheading}>
            {t`Colouring sheets for children.`}
        </p>

        <div className={classes.tabPanel}>
            <ColouringPagesTab/>
        </div>
    </section>
);

export default ResourcesForChildren;
