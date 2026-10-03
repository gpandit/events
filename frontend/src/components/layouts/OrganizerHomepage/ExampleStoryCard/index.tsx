import React from 'react';
import {t} from '@lingui/macro';
import {BoatUnderMoonSilhouette, CatSilhouette, LanternUnderTreeSilhouette} from './Silhouettes';
import {CollapsibleExample} from './CollapsibleExample';
import classes from './ExampleStoryCard.module.scss';

export const ExampleStoryCard: React.FC = () => {
    return (
        <CollapsibleExample
            badge={t`Example 1 — Story`}
            typeLabel={t`Story`}
            title={t`The Lantern Garden`}
            author={t`Zara K. — Year 4`}
        >
            <LanternUnderTreeSilhouette className={classes.illustration}/>

            <p>
                {t`Every year, when the evenings grew cool and the mango trees began to drop their last golden leaves, our school held the Lantern Garden Festival. I had waited the whole year for it.`}
            </p>
            <p>
                {t`My grandmother helped me make my lantern from an old jam jar, a candle stub, and blue tissue paper cut into the shape of waves, because I wanted mine to look like the sea at night. She said that when I was little, I used to point at the moon and call it "the lamp in the sky," and that this lantern should be just as bright.`}
            </p>
            <p>
                {t`On the evening of the festival, I carried my jar carefully across the field, my hands cupped around it so the wind wouldn't blow out the flame. The grass had just been cut, and it smelled like rain even though it hadn't rained in weeks. Hundreds of other lanterns bobbed across the lawn like a second set of stars that had come down to visit the first.`}
            </p>

            <CatSilhouette className={classes.illustration}/>

            <p>
                {t`I found my best friend Noor near the big neem tree. She had made a lantern shaped like a cat, with two triangle ears cut from gold paper. "Yours looks like the ocean," she said. "Mine looks like Mishka," I said, and we both laughed, because Mishka was the stray cat who slept under the library steps and refused to be anyone's pet.`}
            </p>
            <p>
                {t`The teachers had strung fairy lights between the trees, and a man played a guitar near the stage, slow songs that made everyone speak a little quieter than usual. My mother found us and crouched down so her face was lit orange by my jar. "It really does look like the sea," she said, and I felt my chest go warm and proud.`}
            </p>
            <p>
                {t`Near the end of the evening, Mrs. Hassan called all the children to the small pond at the edge of the field. One by one, we were allowed to set our lanterns gently onto little paper boats and let them drift across the water. I was nervous mine would tip over, but Noor held my elbow steady while I leaned down.`}
            </p>

            <BoatUnderMoonSilhouette className={classes.illustration}/>

            <p>
                {t`My lantern floated out slowly, turning in a lazy circle, the blue tissue paper glowing like a small wave caught in a bottle. Noor's cat-lantern drifted beside it, and for a moment it really did look like Mishka was out exploring the pond at night, brave and curious the way real Mishka never quite was.`}
            </p>
            <p>
                {t`We sat on the grass with our knees pulled up, watching the lanterns drift further out until they were just small dots of light among all the other small dots of light. Nobody said very much. I think everyone was thinking their own quiet thoughts, the way you do when something is beautiful and you don't want to spoil it by talking too loudly.`}
            </p>
            <p>
                {t`When we finally walked home, my grandmother asked if the lantern had looked like the sea. I told her it had looked even better — it had looked like the sea at night, full of its own small, floating moons.`}
            </p>
        </CollapsibleExample>
    );
};

export default ExampleStoryCard;
