import {PuzzleRow} from '../puzzleTypes.ts';
import {classify, identify} from './builders.ts';

export const LANGUAGE_14_TO_17: PuzzleRow[] = [
    ["Language", "What does the Latin phrase \"carpe diem\" mean?", "seize the day", "time flies", "good luck", "for the best"],
    ["Language", "What does the Latin phrase \"ad hoc\" mean?", "for this particular purpose", "to a sickening degree", "in good faith", "by itself"],
    ["Language", "What does the Latin phrase \"per se\" mean?", "by or in itself", "for example", "in place of", "after death"],
    ["Language", "What does the Latin phrase \"bona fide\" mean?", "genuine or in good faith", "for free", "good night", "well done"],
    ["Language", "What does the Latin phrase \"quid pro quo\" mean?", "something given in return for something", "as a matter of fact", "without a doubt", "the other way round"],
    ["Language", "What does the Latin phrase \"status quo\" mean?", "the existing state of affairs", "a high position", "the final result", "a legal status"],
    ["Language", "What does the Latin phrase \"vice versa\" mean?", "the other way round", "in place of", "as a result", "against each other"],
    ["Language", "What does the Latin phrase \"alma mater\" refer to?", "the school or university you attended", "your birth mother", "a national anthem", "a famous teacher"],
    ["Language", "What does the Latin phrase \"ad nauseam\" mean?", "to a sickening or tiresome degree", "at the beginning", "for the good of all", "from the sea"],
    ["Language", "What does the Latin phrase \"in loco parentis\" mean?", "in the place of a parent", "in the local area", "without a parent", "in a crazy way"],
    ["Language", "What does the Latin phrase \"persona non grata\" mean?", "an unwelcome person", "a famous person", "a person of grace", "a person without a name"],
    ["Language", "What does the Latin phrase \"pro bono\" mean?", "done for the public good, without payment", "in favour of a boy", "for a good price", "very well done"],
    ["Language", "Who is said to have declared \"Veni, vidi, vici\" (I came, I saw, I conquered)?", "Julius Caesar", "Alexander the Great", "Augustus", "Hannibal"],
    ["Language", "Which technique is used in \"We shall fight on the beaches, we shall fight on the landing grounds\"?", "anaphora", "chiasmus", "oxymoron", "zeugma"],
    ["Language", "Which technique is used in \"Ask not what your country can do for you; ask what you can do for your country\"?", "chiasmus", "alliteration", "personification", "onomatopoeia"],
    ["Language", "Which technique is used in \"She broke his car and his heart\"?", "zeugma", "synecdoche", "euphemism", "simile"],
    ["Language", "Which technique is used in \"All hands on deck\"?", "synecdoche", "metonymy", "paradox", "bathos"],
    ["Language", "Which technique is used when \"the Crown\" is used to mean the monarchy?", "metonymy", "simile", "irony", "hyperbole"],
    ["Language", "Which technique is used in \"Less is more\"?", "paradox", "simile", "onomatopoeia", "pathetic fallacy"],
    ["Language", "Which technique is used in \"The pen is mightier than the sword\"?", "metonymy", "oxymoron", "alliteration", "hyperbole"],
    ["Language", "Which technique is used in \"That's not bad\" to mean \"that's good\"?", "litotes", "hyperbole", "anaphora", "personification"],
    ["Language", "What is a tautology?", "saying the same thing twice in different words", "a contradiction in terms", "an extreme exaggeration", "a hidden meaning"],
    ["Language", "What is enjambment in poetry?", "a sentence running on past the end of a line", "a pause in the middle of a line", "a repeated line", "a rhyme at the start of lines"],
    ["Language", "What is a caesura in poetry?", "a pause within a line", "the final line of a poem", "a repeated sound", "a rhyming couplet"],
    ["Language", "What is the \"volta\" in a sonnet?", "a turn in the argument or mood", "the final rhyming couplet", "the first line", "the title"],
    ["Language", "What is an elegy?", "a poem of mourning", "a poem of praise", "a comic poem", "a love letter"],
    ["Language", "What is an allegory?", "a story with a hidden moral or political meaning", "a very short poem", "a type of rhyme", "a funny misunderstanding"],
    ["Language", "Which of these is an example of an allegory?", "Animal Farm", "A weather report", "A recipe book", "A dictionary"],
    ["Language", "What is satire?", "using humour to criticise people or society", "a very sad story", "a story about gods", "a poem for a wedding"],
    ["Language", "What is a dystopia?", "an imagined society where life is bad and controlled", "a perfect society", "a hidden island", "a story set in the past"],
    ["Language", "In Greek tragedy, what is \"hamartia\"?", "the hero's fatal flaw or error", "excessive pride", "a chorus song", "the final scene"],
    ["Language", "In Greek tragedy, what is \"hubris\"?", "excessive pride", "a hidden wish", "a sad song", "a wise old man"],
    ["Language", "In rhetoric, which appeal is \"pathos\"?", "an appeal to emotion", "an appeal to logic", "an appeal to authority", "an appeal to humour"],
    ["Language", "In rhetoric, which appeal is \"logos\"?", "an appeal to logic and reason", "an appeal to emotion", "an appeal to the speaker's character", "an appeal to fear"],
    ["Language", "In rhetoric, which appeal is \"ethos\"?", "an appeal to credibility and character", "an appeal to emotion", "an appeal to logic", "an appeal to memory"],
    ["Language", "What does \"sycophant\" mean?", "a person who flatters to gain favour", "a wise teacher", "an enemy", "a fearless leader"],
    ["Language", "What does \"pragmatic\" mean?", "dealing with things sensibly and practically", "dreamy and idealistic", "easily angered", "very old-fashioned"],
    ["Language", "What does \"ephemeral\" mean?", "lasting a very short time", "lasting forever", "extremely heavy", "very noisy"],
    ["Language", "What does \"ambivalent\" mean?", "having mixed feelings", "completely certain", "very cheerful", "extremely angry"],
    ["Language", "What does \"laconic\" mean?", "using very few words", "talking constantly", "speaking loudly", "writing poetry"],
    ["Language", "What does \"loquacious\" mean?", "very talkative", "silent", "shy", "rude"],
    ["Language", "What does \"obsequious\" mean?", "too eager to please or obey", "proud and distant", "careless", "wildly angry"],
    ["Language", "What does \"magnanimous\" mean?", "generous and forgiving", "mean-spirited", "very tall", "confused"],
    ["Language", "What does \"ostentatious\" mean?", "showy, designed to impress", "modest", "ancient", "secret"],
    ["Language", "What does \"ameliorate\" mean?", "to make better", "to make worse", "to delay", "to copy"],
    ["Language", "What does \"exacerbate\" mean?", "to make worse", "to make better", "to explain", "to hide"],
    ["Language", "What does \"cacophony\" mean?", "a harsh mixture of loud sounds", "a pleasant melody", "complete silence", "a type of dance"],
    ["Language", "What does \"fastidious\" mean?", "very attentive to detail and hard to please", "quick and careless", "bold and loud", "calm and sleepy"],
    ["Language", "What does \"equivocal\" mean?", "open to more than one interpretation", "perfectly clear", "balanced evenly", "very rude"],
    ["Language", "The word \"alcohol\" comes from which Arabic word?", "al-kuhl", "al-jabr", "qahwa", "sifr"],
    ["Language", "The word \"algorithm\" comes from the name of which scholar?", "al-Khwarizmi", "Euclid", "Pythagoras", "Fibonacci"],
    ["Language", "The word \"admiral\" comes from which Arabic word meaning \"commander\"?", "amir", "habibi", "kitab", "shams"],
    ["Language", "The word \"boycott\" comes from the name of whom?", "Captain Charles Boycott", "Lord Boycott of Wales", "a French merchant", "a Roman senator"],
    ["Language", "The word \"marathon\" comes from a legend linked to which battle?", "the Battle of Marathon", "the Battle of Hastings", "the Battle of Troy", "the Battle of Waterloo"],
    ["Language", "The word \"narcissism\" comes from the name of which figure in Greek myth?", "Narcissus", "Echo", "Icarus", "Orpheus"],
    ["Language", "The adjective \"quixotic\" comes from the hero of which book?", "Don Quixote", "Gulliver's Travels", "Robinson Crusoe", "Moby-Dick"],
    ["Language", "The adjective \"Orwellian\" refers to the ideas in which writer's novels?", "George Orwell", "Aldous Huxley", "Franz Kafka", "H. G. Wells"],
    ["Language", "The adjective \"Kafkaesque\" is linked to which writer?", "Franz Kafka", "Albert Camus", "Thomas Mann", "Leo Tolstoy"],
    ["Language", "What does the phrase \"Achilles' heel\" mean?", "a hidden weakness", "a great strength", "a fast runner", "a final victory"],
    ["Language", "What does the phrase \"Pandora's box\" mean?", "a source of many unforeseen troubles", "a hidden treasure", "a gift from the gods", "a place of safety"],
    ["Language", "What does the phrase \"Pyrrhic victory\" mean?", "a win that costs too much", "an easy victory", "a surprise attack", "a peaceful treaty"],
    ["Language", "What does the phrase \"Herculean task\" mean?", "an extremely difficult task", "a very simple job", "a quick errand", "a heavy lifting competition"],
    ["Language", "What is the study of the origin of words called?", "etymology", "entomology", "semantics", "phonetics"],
    ["Language", "What is the study of the sounds of speech called?", "phonetics", "etymology", "syntax", "morphology"],
    ["Language", "What is the study of sentence structure called?", "syntax", "semantics", "phonetics", "lexicography"],
    ["Language", "What is a portmanteau word?", "a blend of two words, like brunch", "a very long word", "a word borrowed from French", "a word that sounds like its meaning"],
    ["Language", "What is a neologism?", "a newly coined word", "a very old word", "a rhyming word", "a word with no vowels"],
    ["Language", "What is a lingua franca?", "a common language used between groups with different mother tongues", "a dead language", "a secret code", "an ancient alphabet"],
    ["Language", "What is a homonym?", "a word with the same spelling or sound as another but a different meaning", "a word that rhymes", "a word with the opposite meaning", "a shortened word"],
    ["Language", "Which language family does Arabic belong to?", "Semitic (Afroasiatic)", "Indo-European", "Sino-Tibetan", "Turkic"],
    ["Language", "Which script is Hindi written in?", "Devanagari", "Cyrillic", "Arabic script", "Hangul"],
    ["Language", "Which script is used to write Korean?", "Hangul", "Kanji", "Devanagari", "Cyrillic"],
    ["Language", "Who created the constructed language Esperanto?", "L. L. Zamenhof", "J. R. R. Tolkien", "Noam Chomsky", "Samuel Johnson"],
    ["Language", "Which ancient language is the Rig Veda written in?", "Sanskrit", "Latin", "Greek", "Aramaic"],
    ["Language", "Who deciphered Egyptian hieroglyphs using the Rosetta Stone?", "Jean-François Champollion", "Howard Carter", "Heinrich Schliemann", "Napoleon Bonaparte"],
    ["Language", "In which year did the Norman Conquest bring a flood of French words into English?", "1066", "1215", "1415", "1588"],
    ["Language", "In which language was \"Beowulf\" originally written?", "Old English", "Middle English", "Latin", "Old Norse"],
    ["Language", "Which Arab writer won the Nobel Prize in Literature in 1988?", "Naguib Mahfouz", "Taha Hussein", "Khalil Gibran", "Adonis"],
    ["Language", "Who was the first non-European to win the Nobel Prize in Literature, in 1913?", "Rabindranath Tagore", "Pablo Neruda", "Kenzaburō Ōe", "Wole Soyinka"],
    ["Language", "Which sentence uses a semicolon correctly?", "I love reading; my brother prefers films.", "I love; reading my brother prefers films.", "I love reading, my brother; prefers films.", "I; love reading my brother prefers films."],
    ["Language", "Which sentence has a dangling modifier?", "Walking to school, the rain started.", "Walking to school, I got wet in the rain.", "The rain started as I walked to school.", "While I walked to school, it rained."],
    ["Language", "Which sentence uses the subjunctive mood correctly?", "If I were you, I would apologise.", "If I was you, I would apologise.", "If I am you, I would apologise.", "If I be you, I would apologise."],
    ["Language", "Which is a split infinitive?", "to boldly go", "to go boldly", "boldly to go", "go to boldly"],
    ["Language", "Which sentence uses \"fewer\" correctly?", "There are fewer apples in the basket.", "There is fewer water in the jug.", "There are less apples in the basket.", "There is fewer time left."],
    ["Language", "Which sentence is grammatically correct?", "Neither of the boys is here.", "Neither of the boys are here.", "Neither of the boys were here.", "Neither of the boys be here."],
    ["Language", "Who wrote \"Crime and Punishment\"?", "Fyodor Dostoevsky", "Leo Tolstoy", "Anton Chekhov", "Ivan Turgenev"],
    ["Language", "Who wrote \"War and Peace\"?", "Leo Tolstoy", "Fyodor Dostoevsky", "Anton Chekhov", "Nikolai Gogol"],
    ["Language", "Who wrote \"Don Quixote\"?", "Miguel de Cervantes", "Dante Alighieri", "Gabriel García Márquez", "Federico García Lorca"],
    ["Language", "Who wrote \"One Hundred Years of Solitude\"?", "Gabriel García Márquez", "Pablo Neruda", "Jorge Luis Borges", "Isabel Allende"],
    ["Language", "Who wrote \"Things Fall Apart\"?", "Chinua Achebe", "Wole Soyinka", "Ngũgĩ wa Thiong'o", "Nadine Gordimer"],
    ["Language", "Who wrote \"The Kite Runner\"?", "Khaled Hosseini", "Salman Rushdie", "Orhan Pamuk", "Mohsin Hamid"],
    ["Language", "Who wrote \"The God of Small Things\"?", "Arundhati Roy", "Jhumpa Lahiri", "Anita Desai", "Kiran Desai"],
    ["Language", "Who wrote \"Midnight's Children\"?", "Salman Rushdie", "Vikram Seth", "R. K. Narayan", "Amitav Ghosh"],
    ["Language", "Who wrote \"Les Misérables\"?", "Victor Hugo", "Alexandre Dumas", "Gustave Flaubert", "Émile Zola"],
    ["Language", "Who wrote \"Moby-Dick\"?", "Herman Melville", "Nathaniel Hawthorne", "Mark Twain", "Edgar Allan Poe"],
    ["Language", "Who wrote \"Dracula\"?", "Bram Stoker", "Mary Shelley", "Robert Louis Stevenson", "Oscar Wilde"],
    ["Language", "Who wrote the poem \"Ozymandias\"?", "Percy Bysshe Shelley", "John Keats", "Lord Byron", "William Blake"],
    ["Language", "Who wrote the poem \"The Raven\"?", "Edgar Allan Poe", "Walt Whitman", "Robert Frost", "Emily Dickinson"],
    ["Language", "Who wrote the poem \"If—\"?", "Rudyard Kipling", "W. B. Yeats", "T. S. Eliot", "Alfred Tennyson"],
    ["Language", "Which Shakespeare character is the villain who manipulates Othello?", "Iago", "Cassio", "Brabantio", "Roderigo"],
    ["Language", "In which Shakespeare play does the character Shylock appear?", "The Merchant of Venice", "The Tempest", "Twelfth Night", "Macbeth"],
    ["Language", "In which Shakespeare play does the sorcerer Prospero appear?", "The Tempest", "Hamlet", "Othello", "As You Like It"],
    ["Language", "Which Shakespeare character is the mischievous sprite in \"A Midsummer Night's Dream\"?", "Puck", "Ariel", "Oberon", "Bottom"],
    ["Language", "In which novel does the lawyer Atticus Finch appear?", "To Kill a Mockingbird", "The Great Gatsby", "Of Mice and Men", "Lord of the Flies"],
    ["Language", "In which novel does the character Pip appear?", "Great Expectations", "Oliver Twist", "David Copperfield", "Hard Times"],
    ["Language", "Which character says \"Humbug!\" and is visited by three ghosts?", "Ebenezer Scrooge", "Fagin", "Mr Micawber", "Bob Cratchit"],
    ["Language", "In which novel does Winston Smith rebel against Big Brother?", "1984", "Brave New World", "Fahrenheit 451", "Animal Farm"],
];

const WORLD_CITY_LANDMARKS: [string, string][] = [
    ["Paris", "Eiffel_Tower"], ["London", "Big_Ben"], ["New York City", "Statue_of_Liberty"], ["Sydney", "Sydney_Opera_House"],
    ["Dubai", "Burj_Khalifa"], ["Rome", "Colosseum"], ["Rio de Janeiro", "Christ_the_Redeemer_(statue)"],
    ["San Francisco", "Golden_Gate_Bridge"], ["Barcelona", "Sagrada_Família"], ["Istanbul", "Hagia_Sophia"],
    ["Kuala Lumpur", "Petronas_Towers"], ["Singapore", "Marina_Bay_Sands"], ["Beijing", "Forbidden_City"],
    ["Cape Town", "Table_Mountain"], ["Moscow", "Saint_Basil's_Cathedral"], ["Abu Dhabi", "Sheikh_Zayed_Grand_Mosque"],
["Mumbai", "Gateway_of_India"], ["New Delhi", "India_Gate"],
];

const CITY_POOL = [
    "Paris", "London", "New York City", "Sydney", "Dubai", "Rome", "Rio de Janeiro", "San Francisco", "Barcelona",
    "Istanbul", "Kuala Lumpur", "Singapore", "Beijing", "Cape Town", "Moscow", "Abu Dhabi", "Athens", "Berlin", "Mumbai",
    "New Delhi", "Hyderabad", "Kolkata", "Agra", "Pisa", "Tokyo", "Cairo", "Madrid", "Vienna", "Doha", "Jaipur",
];

const FAMOUS_ARTWORKS: [string, string][] = [
    ["Mona Lisa", "Mona_Lisa"], ["The Starry Night", "The_Starry_Night"], ["The Scream", "The_Scream"],
    ["Girl with a Pearl Earring", "Girl_with_a_Pearl_Earring"], ["The Great Wave off Kanagawa", "The_Great_Wave_off_Kanagawa"],
    ["The Last Supper", "The_Last_Supper_(Leonardo)"], ["The Persistence of Memory", "The_Persistence_of_Memory"],
    ["The Birth of Venus", "The_Birth_of_Venus_(Botticelli)"], ["The Night Watch", "The_Night_Watch"],
    ["American Gothic", "American_Gothic"], ["Las Meninas", "Las_Meninas"], ["Guernica", "Guernica_(Picasso)"],
];

const NOBEL_AND_SCIENCE: [string, string][] = [
    ["Max Planck", "Max_Planck"], ["Niels Bohr", "Niels_Bohr"], ["Richard Feynman", "Richard_Feynman"],
    ["Carl Sagan", "Carl_Sagan"], ["Alexander Fleming", "Alexander_Fleming"], ["Jonas Salk", "Jonas_Salk"],
    ["Abdus Salam", "Abdus_Salam"], ["Ahmed Zewail", "Ahmed_Zewail"], ["Tu Youyou", "Tu_Youyou"],
    ["Chien-Shiung Wu", "Chien-Shiung_Wu"], ["Werner Heisenberg", "Werner_Heisenberg"], ["Linus Pauling", "Linus_Pauling"],
];

const TECH_PIONEERS: [string, string][] = [
    ["Steve Jobs", "Steve_Jobs"], ["Bill Gates", "Bill_Gates"], ["Grace Hopper", "Grace_Hopper"],
    ["Tim Berners-Lee", "Tim_Berners-Lee"],];

const HISTORIC_LEADERS: [string, string][] = [
    ["Peter the Great", "Peter_the_Great"], ["Catherine the Great", "Catherine_the_Great"],
    ["Otto von Bismarck", "Otto_von_Bismarck"], ["Simón Bolívar", "Simón_Bolívar"], ["Sun Yat-sen", "Sun_Yat-sen"],
    ["Haile Selassie", "Haile_Selassie"], ["Charles de Gaulle", "Charles_de_Gaulle"], ["Mikhail Gorbachev", "Mikhail_Gorbachev"],
];

const WORLD_LEADERS_AND_CAMPAIGNERS: [string, string][] = [
    ["Kwame Nkrumah", "Kwame_Nkrumah"], ["Lee Kuan Yew", "Lee_Kuan_Yew"], ["Anwar Sadat", "Anwar_Sadat"],
    ["Gamal Abdel Nasser", "Gamal_Abdel_Nasser"], ["Indira Gandhi", "Indira_Gandhi"], ["Benazir Bhutto", "Benazir_Bhutto"],
    ["Subhas Chandra Bose", "Subhas_Chandra_Bose"], ["B. R. Ambedkar", "B._R._Ambedkar"],
    ["Vallabhbhai Patel", "Vallabhbhai_Patel"], ["Golda Meir", "Golda_Meir"], ["Rosa Parks", "Rosa_Parks"],
    ["Malcolm X", "Malcolm_X"],
];

const PHILOSOPHERS: [string, string][] = [
    ["Socrates", "Socrates"], ["Aristotle", "Aristotle"], ["Confucius", "Confucius"], ["Immanuel Kant", "Immanuel_Kant"],
    ["René Descartes", "René_Descartes"], ["John Locke", "John_Locke"],    ["Jean-Jacques Rousseau", "Jean-Jacques_Rousseau"],
];

const CLASSIC_AUTHORS: [string, string][] = [
    ["Fyodor Dostoevsky", "Fyodor_Dostoevsky"], ["Victor Hugo", "Victor_Hugo"], ["Edgar Allan Poe", "Edgar_Allan_Poe"],
    ["Emily Dickinson", "Emily_Dickinson"], ["Oscar Wilde", "Oscar_Wilde"], ["George Bernard Shaw", "George_Bernard_Shaw"],
    ["Franz Kafka", "Franz_Kafka"], ["Virginia Woolf", "Virginia_Woolf"], ["Ernest Hemingway", "Ernest_Hemingway"],
    ["F. Scott Fitzgerald", "F._Scott_Fitzgerald"],
];

const GLOBAL_AUTHORS: [string, string][] = [
    ["Gabriel García Márquez", "Gabriel_García_Márquez"], ["Chinua Achebe", "Chinua_Achebe"], ["Toni Morrison", "Toni_Morrison"],
    ["Naguib Mahfouz", "Naguib_Mahfouz"], ["Haruki Murakami", "Haruki_Murakami"], ["Khaled Hosseini", "Khaled_Hosseini"],
    ["Salman Rushdie", "Salman_Rushdie"], ["Arundhati Roy", "Arundhati_Roy"], ["Margaret Atwood", "Margaret_Atwood"],
    ["Pablo Neruda", "Pablo_Neruda"],
];

const ENDANGERED_ANIMALS: [string, string][] = [
    ["Amur leopard", "Amur_leopard"], ["black rhinoceros", "Black_rhinoceros"], ["mountain gorilla", "Mountain_gorilla"],
    ["vaquita", "Vaquita"], ["kakapo", "Kakapo"], ["Arabian leopard", "Arabian_leopard"],
    ["hawksbill sea turtle", "Hawksbill_sea_turtle"], ["Asian elephant", "Asian_elephant"], ["Bengal tiger", "Bengal_tiger"],
    ["snow leopard", "Snow_leopard"], ["giant panda", "Giant_panda"], ["orangutan", "Orangutan"],
];

const FLAGS_14_TO_17: [string, string][] = [
    ["Nepal", "Flag_of_Nepal"], ["Bhutan", "Flag_of_Bhutan"], ["Cyprus", "Flag_of_Cyprus"], ["Lebanon", "Flag_of_Lebanon"],
    ["Kazakhstan", "Flag_of_Kazakhstan"],["Ukraine", "Flag_of_Ukraine"],
    ["Ethiopia", "Flag_of_Ethiopia"],["Morocco", "Flag_of_Morocco"],
    ["Algeria", "Flag_of_Algeria"],["Iraq", "Flag_of_Iraq"],    ["Singapore", "Flag_of_Singapore"], ["Thailand", "Flag_of_Thailand"],    ["the Philippines", "Flag_of_the_Philippines"],["Malaysia", "Flag_of_Malaysia"],
];

const FLAG_POOL_14_TO_17 = FLAGS_14_TO_17.map(([country]) => country);

export const PICTURES_14_TO_17: PuzzleRow[] = [
    ...classify("Geography", "Which city is this landmark in?", "photo", WORLD_CITY_LANDMARKS, CITY_POOL),
    ...classify("Geography", "Which country's flag is this?", "photo", FLAGS_14_TO_17, FLAG_POOL_14_TO_17),
    ...identify("Art", "Which famous artwork is this?", "photo", FAMOUS_ARTWORKS),
    ...identify("People", "Who is this Nobel Prize-winning or world-changing scientist?", "photo", NOBEL_AND_SCIENCE),
    ...identify("People", "Who is this computing or technology pioneer?", "photo", TECH_PIONEERS),
    ...identify("People", "Who is this historical leader?", "photo", HISTORIC_LEADERS),
    ...identify("People", "Who is this world leader or campaigner?", "photo", WORLD_LEADERS_AND_CAMPAIGNERS),
    ...identify("People", "Who is this philosopher or thinker?", "photo", PHILOSOPHERS),
    ...identify("People", "Who is this famous writer?", "photo", CLASSIC_AUTHORS),
    ...identify("People", "Who is this award-winning author from around the world?", "photo", GLOBAL_AUTHORS),
    ...identify("Animals", "Which endangered animal is this?", "photo", ENDANGERED_ANIMALS),
];
