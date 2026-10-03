import React, {useState} from 'react';
import {t} from '@lingui/macro';
import {IconFeather} from '@tabler/icons-react';
import classes from './ExampleStoryCard.module.scss';

interface CollapsibleExampleProps {
    badge: string;
    typeLabel: string;
    title: string;
    author: string;
    children: React.ReactNode;
}

export const CollapsibleExample: React.FC<CollapsibleExampleProps> = ({badge, typeLabel, title, author, children}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <article className={`${classes.card} ${expanded ? classes.cardExpanded : ''}`}>
            <span className={classes.exampleBadge}>{badge}</span>

            <div className={classes.header}>
                <span className={classes.typeBadge}>
                    <IconFeather size={13}/>
                    {typeLabel}
                </span>
                <h3 className={classes.title}>{title}</h3>
                <p className={classes.author}>{author}</p>
            </div>

            <div className={`${classes.body} ${expanded ? '' : classes.bodyCollapsed}`}>
                {children}
            </div>

            <button
                type="button"
                className={classes.readMore}
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
            >
                {expanded ? t`Show less` : t`Read more`}
            </button>
        </article>
    );
};
