import {PuzzleRow} from '../puzzleTypes.ts';
import {classify, identify} from './builders.ts';

export const LANGUAGE_11_TO_13: PuzzleRow[] = [
    ["Language", "The word \"algebra\" comes from which language?", "Arabic", "Latin", "Greek", "French"],
    ["Language", "The word \"sofa\" comes from which language?", "Arabic", "Italian", "German", "Chinese"],
    ["Language", "The word \"coffee\" can be traced back to which Arabic word?", "qahwa", "kitab", "shams", "yalla"],
    ["Language", "The word \"zero\" can be traced back to which Arabic word?", "sifr", "wahid", "kalb", "bayt"],
    ["Language", "The word \"safari\" comes from which language?", "Swahili", "Hindi", "Japanese", "Russian"],
    ["Language", "The word \"tsunami\" comes from which language?", "Japanese", "Chinese", "Hindi", "Spanish"],
    ["Language", "The word \"pyjamas\" comes from which language?", "Hindi/Urdu", "French", "Greek", "Dutch"],
    ["Language", "The word \"robot\" comes from which language?", "Czech", "Latin", "Japanese", "Italian"],
    ["Language", "The word \"chocolate\" comes from which ancient language?", "Nahuatl (Aztec)", "Latin", "Arabic", "Norse"],
    ["Language", "The word \"sugar\" can be traced back to which Arabic word?", "sukkar", "milh", "ma'", "qamar"],
    ["Language", "What does the Latin root \"aqua\" mean?", "water", "fire", "earth", "air"],
    ["Language", "What does the Latin root \"terra\" mean?", "earth or land", "water", "sky", "sea"],
    ["Language", "What does the Greek root \"photo\" mean?", "light", "sound", "heat", "write"],
    ["Language", "What does the Greek root \"graph\" mean?", "write or draw", "see", "hear", "measure"],
    ["Language", "What does the Greek root \"bio\" mean?", "life", "death", "earth", "star"],
    ["Language", "What does the Greek root \"tele\" mean?", "far away", "near", "small", "large"],
    ["Language", "What does the Greek root \"micro\" mean?", "small", "large", "many", "fast"],
    ["Language", "What does the Latin root \"port\" mean in \"transport\"?", "carry", "push", "sail", "hold still"],
    ["Language", "What does the prefix \"anti-\" mean?", "against", "before", "after", "with"],
    ["Language", "What does the prefix \"omni-\" mean in \"omnivore\"?", "all", "none", "plant", "meat"],
    ["Language", "Which figure of speech is \"The sun smiled down on us\"?", "personification", "simile", "oxymoron", "onomatopoeia"],
    ["Language", "Which figure of speech is \"He is as brave as a lion\"?", "simile", "metaphor", "hyperbole", "irony"],
    ["Language", "Which figure of speech is \"Life is a journey\"?", "metaphor", "simile", "alliteration", "pun"],
    ["Language", "Which figure of speech is \"I've told you a million times!\"?", "hyperbole", "simile", "metaphor", "irony"],
    ["Language", "Which figure of speech is \"Boom! The thunder crashed.\"?", "onomatopoeia", "personification", "simile", "oxymoron"],
    ["Language", "Which figure of speech is \"jumbo shrimp\"?", "oxymoron", "simile", "alliteration", "hyperbole"],
    ["Language", "What is \"passed away\" used instead of \"died\"?", "a euphemism", "a metaphor", "an oxymoron", "a simile"],
    ["Language", "Which of these is a pun?", "\"I used to be a banker, but I lost interest.\"", "\"He ran like the wind.\"", "\"The wind howled.\"", "\"Crash!\""],
    ["Language", "What is a cliché?", "an overused phrase", "a type of poem", "a rhyming word", "a long sentence"],
    ["Language", "Which of these is a cliché?", "\"Avoid it like the plague\"", "\"The moon wore a silver coat\"", "\"The silence hummed\"", "\"A sky of bruised plums\""],
    ["Language", "Choose the correct word: \"I don't know ___ it will rain.\"", "whether", "weather", "wether", "wheather"],
    ["Language", "Choose the correct word: \"The rain will ___ our plans.\"", "affect", "effect", "afect", "efect"],
    ["Language", "Choose the correct word: \"She gave me a ___ on my drawing.\"", "compliment", "complement", "complamant", "complimant"],
    ["Language", "Choose the correct word: \"The school ___ spoke to the class.\"", "principal", "principle", "princepal", "principel"],
    ["Language", "Choose the correct word: \"I bought pens at the ___ shop.\"", "stationery", "stationary", "stationairy", "stationerie"],
    ["Language", "Choose the correct word: \"Don't ___ your keys!\"", "lose", "loose", "looze", "loos"],
    ["Language", "Choose the correct word: \"Everyone ___ Tom came to the party.\"", "except", "accept", "expect", "exsept"],
    ["Language", "Choose the correct word: \"We had ice cream for ___.\"", "dessert", "desert", "desssert", "disert"],
    ["Language", "Choose the correct word: \"___ my best friend.\"", "You're", "Your", "Youre", "Yore"],
    ["Language", "What does \"reluctant\" mean?", "unwilling", "eager", "tired", "clever"],
    ["Language", "What does \"meticulous\" mean?", "very careful and exact", "careless", "very fast", "noisy"],
    ["Language", "What does \"abundant\" mean?", "plentiful", "rare", "tiny", "broken"],
    ["Language", "What does \"vivid\" mean?", "bright and clear", "dull", "quiet", "slow"],
    ["Language", "What does \"frugal\" mean?", "careful with money", "very rich", "generous", "greedy"],
    ["Language", "What does \"gregarious\" mean?", "sociable and fond of company", "shy", "bad-tempered", "very tall"],
    ["Language", "What does \"tranquil\" mean?", "calm and peaceful", "noisy", "dangerous", "fast"],
    ["Language", "What does \"diligent\" mean?", "hard-working", "lazy", "forgetful", "rude"],
    ["Language", "What does \"futile\" mean?", "pointless", "useful", "brave", "ancient"],
    ["Language", "Which sentence is in the active voice?", "The chef cooked the meal.", "The meal was cooked by the chef.", "The meal had been cooked.", "The meal is being cooked."],
    ["Language", "Which sentence is in the future tense?", "We will visit the museum tomorrow.", "We visited the museum yesterday.", "We are visiting the museum now.", "We have visited the museum."],
    ["Language", "Which sentence is in the present perfect tense?", "She has finished her homework.", "She finished her homework.", "She will finish her homework.", "She was finishing her homework."],
    ["Language", "Which sentence is a compound sentence?", "I wanted to go out, but it rained.", "Because it rained, I stayed in.", "I stayed in.", "Staying in the rain."],
    ["Language", "What is a clause?", "a group of words with a subject and a verb", "a single word", "a type of rhyme", "a mark of punctuation"],
    ["Language", "In \"The dog chased the cat\", what is the subject?", "The dog", "chased", "the cat", "cat"],
    ["Language", "Which word is an abstract noun?", "bravery", "table", "river", "pencil"],
    ["Language", "What is the comparative form of \"good\"?", "better", "gooder", "more good", "best"],
    ["Language", "What is the superlative form of \"bad\"?", "worst", "baddest", "worse", "most bad"],
    ["Language", "Which punctuation mark is commonly used to introduce a list?", "a colon", "a full stop", "an apostrophe", "a question mark"],
    ["Language", "What is the plural of \"bacterium\"?", "bacteria", "bacteriums", "bacterii", "bacterias"],
    ["Language", "What is the plural of \"fungus\"?", "fungi", "fungis", "fungus's", "fungae"],
    ["Language", "What is the plural of \"nucleus\"?", "nuclei", "nucleuses", "nucleis", "nucleae"],
    ["Language", "What is the plural of \"medium\" when talking about newspapers and TV?", "media", "mediums", "medias", "mediae"],
    ["Language", "Which phrase did William Shakespeare help make popular: \"break the ___\"?", "ice", "glass", "wall", "chain"],
    ["Language", "In which play does the line \"Parting is such sweet sorrow\" appear?", "Romeo and Juliet", "Macbeth", "Hamlet", "The Tempest"],
    ["Language", "In which play does the line \"Double, double toil and trouble\" appear?", "Macbeth", "Romeo and Juliet", "Othello", "King Lear"],
    ["Language", "Which play begins a famous speech with \"To be, or not to be\"?", "Hamlet", "Macbeth", "Othello", "Twelfth Night"],
    ["Language", "Which day of the week is named after the Norse god Thor?", "Thursday", "Tuesday", "Wednesday", "Friday"],
    ["Language", "Which day of the week is named after the Norse god Woden (Odin)?", "Wednesday", "Thursday", "Tuesday", "Saturday"],
    ["Language", "Which day of the week is named after the Roman god Saturn?", "Saturday", "Sunday", "Monday", "Friday"],
    ["Language", "Which month is named after the Roman emperor Julius Caesar?", "July", "June", "August", "March"],
    ["Language", "Which month is named after the Roman god of war, Mars?", "March", "May", "June", "April"],
    ["Language", "What does the Latin-based name \"September\" originally mean?", "seventh month", "ninth month", "first month", "autumn month"],
    ["Language", "The word \"quarantine\" comes from an Italian phrase meaning what?", "forty days", "stay at home", "keep away", "four weeks"],
    ["Language", "The word \"salary\" is linked to which everyday item in Roman times?", "salt", "gold", "bread", "oil"],
    ["Language", "The flower name \"daisy\" comes from the Old English words for what?", "day's eye", "sun face", "white petal", "field star"],
    ["Language", "The word \"sandwich\" was named after whom?", "the Earl of Sandwich", "a baker called Sand", "a beach town", "a French chef"],
    ["Language", "The word \"disaster\" comes from an Italian phrase meaning what?", "bad star", "big storm", "great fear", "dark sky"],
    ["Language", "The word \"muscle\" comes from a Latin word meaning what?", "little mouse", "strong arm", "hard rope", "flowing water"],
    ["Language", "The word \"window\" comes from Old Norse words meaning what?", "wind eye", "glass door", "wall hole", "sun gate"],
    ["Language", "What does the proverb \"Don't put all your eggs in one basket\" mean?", "don't risk everything on one thing", "carry fewer eggs", "baskets are fragile", "eat before you shop"],
    ["Language", "What does the proverb \"A watched pot never boils\" mean?", "waiting makes time seem slower", "water is hard to heat", "cooking needs patience and skill", "never leave the kitchen"],
    ["Language", "What does the proverb \"Birds of a feather flock together\" mean?", "similar people stick together", "birds fly south", "feathers are light", "friends fall out"],
    ["Language", "What does the proverb \"Too many cooks spoil the broth\" mean?", "too many people can ruin a task", "soup is hard to make", "cooks need more salt", "kitchens should be large"],
    ["Language", "Which language has the most native speakers in the world?", "Mandarin Chinese", "English", "Spanish", "Hindi"],
    ["Language", "How many official languages does the United Nations have?", "6", "3", "10", "12"],
    ["Language", "English belongs to which family of languages?", "Germanic", "Romance", "Slavic", "Semitic"],
    ["Language", "Which writing system is used for Russian?", "Cyrillic", "Latin", "Arabic script", "Devanagari"],
    ["Language", "Which ancient stone helped scholars decode Egyptian hieroglyphs?", "the Rosetta Stone", "the Blarney Stone", "Stonehenge", "the Sphinx"],
    ["Language", "Who invented the reading system for blind people called Braille?", "Louis Braille", "Louis Pasteur", "Louis Armstrong", "Alexander Graham Bell"],
    ["Language", "Which language is spoken in Brazil?", "Portuguese", "Spanish", "French", "English"],
    ["Language", "The numbers 0 to 9 that we use today are often called which type of numerals?", "Hindu-Arabic", "Roman", "Greek", "Chinese"],
    ["Language", "Who wrote \"The Hobbit\"?", "J. R. R. Tolkien", "C. S. Lewis", "Roald Dahl", "Philip Pullman"],
    ["Language", "Who wrote \"Charlotte's Web\"?", "E. B. White", "Beverly Cleary", "Roald Dahl", "L. Frank Baum"],
    ["Language", "Who wrote \"Treasure Island\"?", "Robert Louis Stevenson", "Charles Dickens", "Daniel Defoe", "Jules Verne"],
    ["Language", "Who wrote \"Oliver Twist\" and \"A Christmas Carol\"?", "Charles Dickens", "Mark Twain", "Thomas Hardy", "Jane Austen"],
    ["Language", "Who wrote \"Little Women\"?", "Louisa May Alcott", "Jane Austen", "Emily Dickinson", "Charlotte Brontë"],
    ["Language", "Who wrote \"The Wind in the Willows\"?", "Kenneth Grahame", "A. A. Milne", "Rudyard Kipling", "Lewis Carroll"],
    ["Language", "Who wrote \"Around the World in Eighty Days\"?", "Jules Verne", "H. G. Wells", "Mark Twain", "Daniel Defoe"],
    ["Language", "Who wrote \"The Secret Garden\"?", "Frances Hodgson Burnett", "Louisa May Alcott", "Anna Sewell", "Enid Blyton"],
    ["Language", "Who wrote \"Black Beauty\"?", "Anna Sewell", "Beatrix Potter", "Jane Austen", "L. M. Montgomery"],
    ["Language", "Who wrote \"The Hunger Games\"?", "Suzanne Collins", "Veronica Roth", "J. K. Rowling", "Stephenie Meyer"],
    ["Language", "Which collection of Middle Eastern tales includes the voyages of Sinbad the Sailor?", "One Thousand and One Nights", "The Jungle Book", "Aesop's Fables", "The Odyssey"],
    ["Language", "Which Greek storyteller is famous for fables such as \"The Tortoise and the Hare\"?", "Aesop", "Homer", "Plato", "Sophocles"],
    ["Language", "Which word is spelled correctly?", "occasion", "ocassion", "occassion", "occation"],
    ["Language", "Which word is spelled correctly?", "accommodate", "acommodate", "accomodate", "acomodate"],
    ["Language", "Which word is spelled correctly?", "tomorrow", "tommorow", "tomorow", "tommorrow"],
    ["Language", "Which word is spelled correctly?", "parallel", "paralel", "parallell", "parrallel"],
    ["Language", "Which word is spelled correctly?", "environment", "enviroment", "enviornment", "environmant"],
    ["Language", "Which word is spelled correctly?", "government", "goverment", "govenment", "govermant"],
    ["Language", "Which word is spelled correctly?", "weird", "wierd", "wierdd", "weard"],
    ["Language", "Which word is spelled correctly?", "mischievous", "mischievious", "mischevous", "mischeivous"],
];

const COUNTRY_POOL = [
    "France", "United Kingdom", "India", "Egypt", "United States", "Australia", "Italy", "China", "United Arab Emirates",
    "Peru", "Brazil", "Jordan", "Japan", "Cambodia", "Spain", "Germany", "Mexico", "Turkey", "South Africa", "Tanzania",
    "Greece", "Malaysia", "Singapore", "Russia", "Morocco",
];

const BIG_LANDMARKS_BY_COUNTRY: [string, string][] = [
    ["France", "Eiffel_Tower"], ["United Kingdom", "Big_Ben"], ["India", "Taj_Mahal"], ["Egypt", "Great_Pyramid_of_Giza"],
    ["United States", "Statue_of_Liberty"], ["Australia", "Sydney_Opera_House"], ["Italy", "Leaning_Tower_of_Pisa"],
    ["China", "Great_Wall_of_China"], ["United Arab Emirates", "Burj_Khalifa"], ["Italy", "Colosseum"],
    ["Peru", "Machu_Picchu"], ["Brazil", "Christ_the_Redeemer_(statue)"], ["United Kingdom", "Stonehenge"],
    ["Jordan", "Petra"], ["United Arab Emirates", "Sheikh_Zayed_Grand_Mosque"], ["Japan", "Mount_Fuji"],
    ["Cambodia", "Angkor_Wat"], ["Spain", "Sagrada_Família"], ["Germany", "Neuschwanstein_Castle"],
    ["Mexico", "Chichen_Itza"], ["Turkey", "Hagia_Sophia"], ["South Africa", "Table_Mountain"],
    ["Tanzania", "Mount_Kilimanjaro"], ["Australia", "Uluru"], ["Greece", "Parthenon"], ["China", "Forbidden_City"],
    ["Malaysia", "Petronas_Towers"], ["Singapore", "Marina_Bay_Sands"], ["Russia", "Saint_Basil's_Cathedral"],
    ["Morocco", "Hassan_II_Mosque"],
];

const LANDMARK_NAMES: [string, string][] = [
    ["Petra", "Petra"], ["Angkor Wat", "Angkor_Wat"], ["Hagia Sophia", "Hagia_Sophia"],
    ["Sagrada Família", "Sagrada_Família"], ["Chichen Itza", "Chichen_Itza"], ["Neuschwanstein Castle", "Neuschwanstein_Castle"],
    ["Forbidden City", "Forbidden_City"], ["Petronas Towers", "Petronas_Towers"], ["Marina Bay Sands", "Marina_Bay_Sands"],
    ["The Parthenon", "Parthenon"], ["Uluru", "Uluru"], ["Table Mountain", "Table_Mountain"],
];

const MORE_ANIMALS: [string, string][] = [
    ["pangolin", "Pangolin"], ["axolotl", "Axolotl"], ["okapi", "Okapi"], ["narwhal", "Narwhal"], ["manatee", "Manatee"],
    ["quokka", "Quokka"], ["capybara", "Capybara"], ["tapir", "Tapir"], ["snow leopard", "Snow_leopard"],
    ["Arabian oryx", "Arabian_oryx"], ["dugong", "Dugong"], ["fennec fox", "Fennec_fox"], ["whale shark", "Whale_shark"],
    ["peregrine falcon", "Peregrine_falcon"], ["echidna", "Echidna"], ["mandrill", "Mandrill"],
    ["proboscis monkey", "Proboscis_monkey"], ["sloth", "Sloth"],
];

const PLANETS: [string, string][] = [
    ["Mercury", "Mercury_(planet)"], ["Venus", "Venus"], ["Mars", "Mars"], ["Jupiter", "Jupiter"], ["Saturn", "Saturn"],
    ["Uranus", "Uranus"], ["Neptune", "Neptune"],
];

const SCIENTISTS: [string, string][] = [
    ["Michael Faraday", "Michael_Faraday"], ["Alan Turing", "Alan_Turing"], ["Rosalind Franklin", "Rosalind_Franklin"],
    ["Jane Goodall", "Jane_Goodall"], ["Ada Lovelace", "Ada_Lovelace"], ["Dmitri Mendeleev", "Dmitri_Mendeleev"],
    ["Gregor Mendel", "Gregor_Mendel"], ["Nicolaus Copernicus", "Nicolaus_Copernicus"],
    ["Katherine Johnson", "Katherine_Johnson"], ["Tim Berners-Lee", "Tim_Berners-Lee"],
    ["A. P. J. Abdul Kalam", "A._P._J._Abdul_Kalam"], ["Srinivasa Ramanujan", "Srinivasa_Ramanujan"],
    ["C. V. Raman", "C._V._Raman"], ["Mae Jemison", "Mae_Jemison"],
];

const HISTORICAL_RULERS: [string, string][] = [
    ["Cleopatra", "Cleopatra"], ["Julius Caesar", "Julius_Caesar"], ["Alexander the Great", "Alexander_the_Great"],
    ["Genghis Khan", "Genghis_Khan"], ["Saladin", "Saladin"], ["Akbar", "Akbar"],
    ["Suleiman the Magnificent", "Suleiman_the_Magnificent"], ["Queen Elizabeth I", "Elizabeth_I"],
    ["Henry VIII", "Henry_VIII"], ["Napoleon Bonaparte", "Napoleon"], ["Queen Victoria", "Queen_Victoria"],
];

const MODERN_LEADERS: [string, string][] = [
    ["John F. Kennedy", "John_F._Kennedy"], ["Margaret Thatcher", "Margaret_Thatcher"],
    ["Jawaharlal Nehru", "Jawaharlal_Nehru"], ["Mustafa Kemal Atatürk", "Mustafa_Kemal_Atatürk"],
    ["Franklin D. Roosevelt", "Franklin_D._Roosevelt"], ["Nelson Mandela", "Nelson_Mandela"],
    ["Mahatma Gandhi", "Mahatma_Gandhi"], ["Winston Churchill", "Winston_Churchill"],
];

const ARTISTS: [string, string][] = [
    ["Leonardo da Vinci", "Leonardo_da_Vinci"], ["Pablo Picasso", "Pablo_Picasso"], ["Vincent van Gogh", "Vincent_van_Gogh"],
    ["Michelangelo", "Michelangelo"], ["Frida Kahlo", "Frida_Kahlo"], ["Wolfgang Amadeus Mozart", "Wolfgang_Amadeus_Mozart"],
    ["Ludwig van Beethoven", "Ludwig_van_Beethoven"], ["Claude Monet", "Claude_Monet"],
];

const AUTHORS: [string, string][] = [
    ["J. R. R. Tolkien", "J._R._R._Tolkien"], ["Agatha Christie", "Agatha_Christie"], ["Maya Angelou", "Maya_Angelou"],
    ["Rabindranath Tagore", "Rabindranath_Tagore"], ["Leo Tolstoy", "Leo_Tolstoy"], ["George Orwell", "George_Orwell"],
    ["Mark Twain", "Mark_Twain"], ["Charles Dickens", "Charles_Dickens"],
];

const FLAGS: [string, string][] = [
    ["Qatar", "Flag_of_Qatar"], ["Oman", "Flag_of_Oman"],["Bahrain", "Flag_of_Bahrain"],
    ["Jordan", "Flag_of_Jordan"], ["Pakistan", "Flag_of_Pakistan"], ["Bangladesh", "Flag_of_Bangladesh"],
    ["Sri Lanka", "Flag_of_Sri_Lanka"], ["Greece", "Flag_of_Greece"], ["Ireland", "Flag_of_Ireland"],
    ["Argentina", "Flag_of_Argentina"], ["Chile", "Flag_of_Chile"], ["Nigeria", "Flag_of_Nigeria"], ["Kenya", "Flag_of_Kenya"],
    ["Russia", "Flag_of_Russia"],["the Netherlands", "Flag_of_the_Netherlands"],
["New Zealand", "Flag_of_New_Zealand"],
];

const ARTWORKS: [string, string][] = [
    ["Mona Lisa", "Mona_Lisa"], ["The Starry Night", "The_Starry_Night"], ["The Scream", "The_Scream"],
    ["Girl with a Pearl Earring", "Girl_with_a_Pearl_Earring"], ["The Great Wave off Kanagawa", "The_Great_Wave_off_Kanagawa"],
];

const IDIOM_PICTURES: [string, string][] = [
    ["raining cats and dogs", "☔🐱🐶"], ["elephant in the room", "🐘🏠"], ["piece of cake", "🧩🍰"],
    ["once in a blue moon", "🔵🌙"], ["money doesn't grow on trees", "💰🌳"], ["let the cat out of the bag", "🐱👜"],
["don't put all your eggs in one basket", "🥚🧺"],
];

export const PICTURES_11_TO_13: PuzzleRow[] = [
    ...classify("Geography", "Which country's flag is this?", "photo", FLAGS, FLAGS.map(([country]) => country)),
    ...identify("Art", "Which famous artwork is this?", "photo", ARTWORKS),
    ...classify("Language", "Which idiom do these pictures show?", "emoji", IDIOM_PICTURES, IDIOM_PICTURES.map(([idiom]) => idiom)),
    ...classify("Geography", "Which country is this landmark in?", "photo", BIG_LANDMARKS_BY_COUNTRY, COUNTRY_POOL),
    ...identify("Places", "Which famous place is this?", "photo", LANDMARK_NAMES),
    ...identify("Animals", "Which animal is this?", "photo", MORE_ANIMALS),
    ...identify("Science", "Which planet is this?", "photo", PLANETS),
    ...identify("People", "Who is this famous scientist?", "photo", SCIENTISTS),
    ...identify("People", "Who is this historical ruler?", "photo", HISTORICAL_RULERS),
    ...identify("People", "Who is this leader from the last hundred years?", "photo", MODERN_LEADERS),
    ...identify("Art", "Who is this famous artist or composer?", "photo", ARTISTS),
    ...identify("People", "Who is this famous author?", "photo", AUTHORS),
];
