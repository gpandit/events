import {t} from '@lingui/macro';
import {AgeBand, PuzzleSubject} from './puzzleTypes.ts';

export const ageBandLabel = (band: AgeBand | string) => {
    switch (band) {
        case '5-7':
            return t`Ages 5 to 7`;
        case '8-10':
            return t`Ages 8 to 10`;
        case '11-13':
            return t`Ages 11 to 13`;
        default:
            return t`Ages 14 to 17`;
    }
};

export const subjectLabel = (subject: PuzzleSubject) => {
    switch (subject) {
        case 'English':
            return t`English`;
        case 'Science':
            return t`Science`;
        case 'Maths':
            return t`Maths`;
        case 'Geography':
            return t`Geography`;
        default:
            return t`History`;
    }
};
