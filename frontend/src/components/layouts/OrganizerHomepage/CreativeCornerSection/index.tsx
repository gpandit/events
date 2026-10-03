import {Link} from "react-router";
import {t} from "@lingui/macro";
import {IconBulb, IconFeather, IconPalette} from "@tabler/icons-react";
import {Organizer} from "../../../../types.ts";
import {organizerHomepagePath, organizerResourcesPath} from "../../../../utilites/urlHelper.ts";
import classes from './CreativeCornerSection.module.scss';

interface CreativeCornerSectionProps {
    organizer: Organizer;
}

export const CreativeCornerSection = ({organizer}: CreativeCornerSectionProps) => {
    const boxes = [
        {
            icon: <IconPalette size={32}/>,
            title: t`Creative Colouring`,
            description: t`Fun pages to print, colour and display.`,
            cta: t`Colouring pages`,
            to: organizerResourcesPath(organizer, 'colouring-pages'),
            testId: 'creative-colouring-link',
        },
        {
            icon: <IconFeather size={32}/>,
            title: t`Creative Writers`,
            description: t`Share your own stories and poems with everyone.`,
            cta: t`Prose & Poetry`,
            to: `${organizerHomepagePath(organizer)}/stories`,
            testId: 'creative-writers-link',
        },
        {
            icon: <IconBulb size={32}/>,
            title: t`Creative Minds`,
            description: t`Puzzles and quizzes to challenge curious thinkers.`,
            cta: t`Puzzles`,
            to: organizerResourcesPath(organizer, 'puzzles'),
            testId: 'creative-minds-link',
        },
    ];

    return (
        <section className={classes.section}>
            <h2 className={classes.heading}>{t`Creative Corner`}</h2>
            <div className={classes.grid}>
                {boxes.map(box => (
                    <div key={box.testId} className={classes.box}>
                        <div className={classes.icon}>{box.icon}</div>
                        <h3 className={classes.title}>{box.title}</h3>
                        <p className={classes.description}>{box.description}</p>
                        <Link to={box.to} className={classes.button} data-testid={box.testId}>
                            {box.cta}
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CreativeCornerSection;
