import React from 'react';
import {t} from '@lingui/macro';
import {CollapsibleExample} from './CollapsibleExample';
import classes from './ExampleStoryCard.module.scss';

export const ExamplePoemCard: React.FC = () => {
    return (
        <CollapsibleExample
            badge={t`Example 2 — Poem`}
            typeLabel={t`Poem`}
            title={t`Rain on the Roof`}
            author={t`Amir S. — Year 6`}
        >
            <div className={classes.poem}>
                <p>
                    {t`The sky pulls on its heavy grey coat,`}<br/>
                    {t`and the first drops tap-tap-tap,`}<br/>
                    {t`a hundred tiny drummers`}<br/>
                    {t`marching across our roof.`}
                </p>
                <p>
                    {t`The puddles open up like mirrors,`}<br/>
                    {t`each one holding a piece of the clouds,`}<br/>
                    {t`and I jump right into the middle`}<br/>
                    {t`to see if I can reach the sky.`}
                </p>
                <p>
                    {t`Grandpa says the rain is only visiting,`}<br/>
                    {t`bringing water for the mango trees,`}<br/>
                    {t`and when it leaves it tucks a rainbow`}<br/>
                    {t`behind the garden gate.`}
                </p>
            </div>
        </CollapsibleExample>
    );
};

export default ExamplePoemCard;
