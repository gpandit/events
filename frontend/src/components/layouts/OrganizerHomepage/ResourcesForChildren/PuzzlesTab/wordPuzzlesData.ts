export interface WordPuzzle {
    question: string;
    options: [string, string, string, string];
    answer: string;
}

export const WORD_PUZZLES: WordPuzzle[] = [
    {question: 'Which word means "extremely careful and precise"?', options: ['Careless', 'Meticulous', 'Hasty', 'Noisy'], answer: 'Meticulous'},
    {question: 'Which word is the opposite of "scarce"?', options: ['Rare', 'Plentiful', 'Tiny', 'Hidden'], answer: 'Plentiful'},
    {question: 'Which is the correct spelling?', options: ['Acommodation', 'Accomodation', 'Accommodation', 'Acomodation'], answer: 'Accommodation'},
    {question: 'What does "ephemeral" mean?', options: ['Lasting forever', 'Lasting a very short time', 'Very heavy', 'Very bright'], answer: 'Lasting a very short time'},
    {question: 'Which word is closest in meaning to "reluctant"?', options: ['Eager', 'Brave', 'Unwilling', 'Silent'], answer: 'Unwilling'},
    {question: 'Which word is the opposite of "verbose"?', options: ['Wordy', 'Loud', 'Clever', 'Concise'], answer: 'Concise'},
    {question: 'What does "ambiguous" mean?', options: ['Clear to everyone', 'Open to more than one meaning', 'Dangerous', 'Friendly'], answer: 'Open to more than one meaning'},
    {question: 'Which word means "to make a problem less severe"?', options: ['Aggravate', 'Complicate', 'Ignore', 'Alleviate'], answer: 'Alleviate'},
    {question: 'Hot is to cold as ascend is to ...', options: ['Climb', 'Rise', 'Descend', 'Jump'], answer: 'Descend'},
    {question: 'Which word is closest in meaning to "candid"?', options: ['Honest', 'Secretive', 'Shy', 'Sweet'], answer: 'Honest'},
    {question: 'Which is the correct spelling?', options: ['Neccessary', 'Necessary', 'Necesary', 'Neccesary'], answer: 'Necessary'},
    {question: 'What does "frugal" mean?', options: ['Wasteful', 'Very rich', 'Careful with money', 'Generous'], answer: 'Careful with money'},
    {question: 'Which word is closest in meaning to "abundant"?', options: ['Scarce', 'Fragile', 'Distant', 'Plentiful'], answer: 'Plentiful'},
    {question: 'What does "tenacious" mean?', options: ['Easily giving up', 'Holding on firmly and not giving up', 'Silly', 'Weak'], answer: 'Holding on firmly and not giving up'},
    {question: 'Which word is the opposite of "ancient"?', options: ['Old', 'Historic', 'Modern', 'Faded'], answer: 'Modern'},
    {question: 'Which word means "a person who speaks on behalf of others"?', options: ['Spectator', 'Spokesperson', 'Stranger', 'Sculptor'], answer: 'Spokesperson'},
    {question: 'What does "gregarious" mean?', options: ['Angry', 'Greedy', 'Fond of company', 'Sleepy'], answer: 'Fond of company'},
    {question: 'Which word means "to look at something very briefly"?', options: ['Stare', 'Glance', 'Gaze', 'Glare'], answer: 'Glance'},
    {question: 'A "pessimist" is someone who ...', options: ['Expects the best', 'Never worries', 'Expects the worst', 'Loves puzzles'], answer: 'Expects the worst'},
    {question: 'Which is the correct spelling?', options: ['Consciencious', 'Conscientous', 'Conscienscious', 'Conscientious'], answer: 'Conscientious'},
];
