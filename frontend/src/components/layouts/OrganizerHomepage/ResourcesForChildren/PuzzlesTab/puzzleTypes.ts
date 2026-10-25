export type AgeBand = '5-7' | '8-10' | '11-13' | '14-17';

export type PuzzleSubject =
    | 'English'
    | 'Science'
    | 'Maths'
    | 'Geography'
    | 'History'
    | 'Language'
    | 'Animals'
    | 'Places'
    | 'Art'
    | 'People';

export type PuzzleVisual =
    | { kind: 'emoji'; value: string }
    | { kind: 'photo'; value: string };

export interface Puzzle {
    id: string;
    subject: PuzzleSubject;
    question: string;
    options: [string, string, string, string];
    answer: string;
    visual?: PuzzleVisual;
}

export type PuzzleRow =
    | [PuzzleSubject, string, string, string, string, string]
    | [PuzzleSubject, string, string, string, string, string, string];
