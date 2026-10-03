import {Fragment} from 'react';
import classes from './Wordmark.module.scss';

interface WordmarkProps {
    name: string;
    className?: string;
}

export const Wordmark = ({name, className}: WordmarkProps) => (
    <span className={`${classes.wordmark} ${className ?? ''}`}>
        {name.split(' ').map((word, index) => (
            <Fragment key={index}>
                {index > 0 && ' '}
                {word.toLowerCase() === 'of' ? <span className={classes.cursive}>{word}</span> : word}
            </Fragment>
        ))}
    </span>
);

export default Wordmark;
