import {PuzzleRow} from '../puzzleTypes.ts';
import {counting, firstLetter, identify, spellIt} from './builders.ts';

export const LANGUAGE_5_TO_7: PuzzleRow[] = [
    ["Language", "How do you say hello in Spanish?", "hola", "bonjour", "ciao", "namaste"],
    ["Language", "How do you say hello in French?", "bonjour", "hola", "ciao", "konnichiwa"],
    ["Language", "\"Marhaba\" is a way to say hello in which language?", "Arabic", "French", "Spanish", "Japanese"],
    ["Language", "What does \"shukran\" mean in Arabic?", "thank you", "hello", "goodbye", "sorry"],
    ["Language", "What does \"merci\" mean in French?", "thank you", "please", "goodbye", "hello"],
    ["Language", "What does \"gracias\" mean in Spanish?", "thank you", "please", "hello", "water"],
    ["Language", "\"Namaste\" is a greeting from which country?", "India", "France", "Spain", "Japan"],
    ["Language", "How do you say thank you in German?", "danke", "merci", "gracias", "grazie"],
    ["Language", "\"Ciao\" is a friendly hello and goodbye in which language?", "Italian", "French", "Arabic", "German"],
    ["Language", "What does \"ma'a salama\" mean in Arabic?", "goodbye", "hello", "thank you", "good morning"],
    ["Language", "\"Konnichiwa\" is how you say hello in which language?", "Japanese", "Spanish", "Arabic", "French"],
    ["Language", "What does \"au revoir\" mean in French?", "goodbye", "hello", "thank you", "please"],
    ["Language", "In Spanish, what number is \"dos\"?", "2", "1", "3", "4"],
    ["Language", "In French, \"rouge\" is which colour?", "red", "blue", "green", "yellow"],
    ["Language", "In French, what is a \"chat\"?", "a cat", "a dog", "a bird", "a fish"],
    ["Language", "What sound does a sheep make?", "baa", "moo", "woof", "meow"],
    ["Language", "What sound does a duck make?", "quack", "moo", "roar", "hiss"],
    ["Language", "What sound does a pig make?", "oink", "baa", "neigh", "buzz"],
    ["Language", "What sound does a snake make?", "hiss", "hoot", "moo", "woof"],
    ["Language", "What sound does an owl make?", "hoot", "quack", "oink", "baa"],
    ["Language", "Which word rhymes with \"hen\"?", "ten", "hat", "hop", "hug"],
    ["Language", "Which word rhymes with \"fox\"?", "box", "fix", "fan", "fun"],
    ["Language", "Which word rhymes with \"king\"?", "ring", "kit", "kick", "keep"],
    ["Language", "Which word rhymes with \"ball\"?", "tall", "bell", "bill", "bull"],
    ["Language", "Which word rhymes with \"fish\"?", "dish", "fist", "fast", "fine"],
    ["Language", "What is the opposite of \"fast\"?", "slow", "quick", "loud", "high"],
    ["Language", "What is the opposite of \"open\"?", "shut", "wide", "tall", "near"],
    ["Language", "What is the opposite of \"full\"?", "empty", "big", "heavy", "round"],
    ["Language", "What is the opposite of \"old\"?", "new", "tall", "cold", "long"],
    ["Language", "What is the opposite of \"clean\"?", "dirty", "wet", "dry", "soft"],
    ["Language", "What is the opposite of \"laugh\"?", "cry", "smile", "jump", "sing"],
    ["Language", "What is the opposite of \"push\"?", "pull", "pick", "pat", "pour"],
    ["Language", "What is the opposite of \"stop\"?", "go", "stay", "sit", "stand"],
    ["Language", "What is the opposite of \"first\"?", "last", "next", "late", "small"],
    ["Language", "What word do you make with \"rain\" and \"bow\"?", "rainbow", "bowrain", "rainboat", "rainbowl"],
    ["Language", "What word do you make with \"sun\" and \"flower\"?", "sunflower", "flowersun", "sunflour", "sunflowing"],
    ["Language", "What word do you make with \"foot\" and \"ball\"?", "football", "ballfoot", "footbell", "footbowl"],
    ["Language", "What word do you make with \"butter\" and \"fly\"?", "butterfly", "flybutter", "butterfli", "buttafly"],
    ["Language", "How many claps (syllables) are in \"elephant\"?", "3", "1", "2", "4"],
    ["Language", "How many claps (syllables) are in \"pizza\"?", "2", "1", "3", "4"],
    ["Language", "How many claps (syllables) are in \"butterfly\"?", "3", "2", "4", "1"],
    ["Language", "What day comes after Monday?", "Tuesday", "Sunday", "Wednesday", "Friday"],
    ["Language", "What is the first month of the year?", "January", "March", "December", "June"],
    ["Language", "Which of these is a \"doing\" word (a verb)?", "jump", "table", "blue", "soft"],
    ["Language", "Which of these is a describing word (an adjective)?", "soft", "run", "chair", "eat"],
    ["Language", "Which of these is a naming word (a noun)?", "apple", "sleep", "loud", "quickly"],
    ["Language", "Which word needs a capital letter?", "Sam", "dog", "tree", "chair"],
    ["Language", "Which sentence starts with a capital letter?", "My name is Sam.", "my name is Sam.", "my Name is sam.", "my name Is Sam."],
    ["Language", "Which punctuation mark do we use when we shout or are very surprised?", "an exclamation mark", "a comma", "a full stop", "a question mark"],
    ["Language", "Which sentence needs a question mark at the end?", "Where is my hat", "I like my hat", "Put on your hat", "What a nice hat"],
    ["Language", "Which letter comes after M in the alphabet?", "N", "L", "O", "P"],
    ["Language", "What letter comes at the end of the alphabet?", "Z", "A", "X", "Y"],
    ["Language", "Which word sounds the same as \"sun\" but means a boy child?", "son", "sin", "sung", "sum"],
    ["Language", "Which word sounds the same as \"sea\" but means \"to look\"?", "see", "say", "set", "saw"],
    ["Language", "Which word sounds the same as \"two\" but means \"also\"?", "too", "toe", "tow", "tea"],
    ["Language", "Which word is the number word for 8?", "eight", "eigth", "eiht", "aite"],
    ["Language", "Which word is the number word for 5?", "five", "fiv", "fyve", "faive"],
    ["Language", "Which word is the number word for 3?", "three", "thre", "tree", "free"],
    ["Language", "Which word is the odd one out?", "carrot", "banana", "apple", "grape"],
    ["Language", "Which word is the odd one out?", "chair", "cat", "dog", "horse"],
    ["Language", "Which word is the odd one out?", "table", "red", "blue", "green"],
    ["Language", "Which word is the odd one out?", "car", "cow", "sheep", "pig"],
    ["Language", "I have four legs and I bark. What am I?", "a dog", "a cat", "a fish", "a bird"],
    ["Language", "I am yellow, I am a fruit and monkeys love me. What am I?", "a banana", "an apple", "a plum", "a lemon"],
    ["Language", "I fall from the clouds and make puddles. What am I?", "rain", "sand", "a leaf", "a stone"],
    ["Language", "I have hands but I cannot clap. What am I?", "a clock", "a chair", "a bird", "a hat"],
    ["Language", "I am round, I bounce and you can kick me. What am I?", "a ball", "a box", "a book", "a shoe"],
    ["Language", "I shine at night and change shape. What am I?", "the moon", "the sun", "a cloud", "a tree"],
    ["Language", "I have a long trunk but I am not a tree. What am I?", "an elephant", "a giraffe", "a lion", "a zebra"],
    ["Animals", "What is a baby duck called?", "a duckling", "a gosling", "a chick", "a cub"],
    ["Animals", "What is a baby chicken called?", "a chick", "a duckling", "a calf", "a cub"],
    ["Animals", "What is a baby bear called?", "a cub", "a pup", "a kit", "a foal"],
];

const ZOO: [string, string][] = [
    ["elephant", "🐘"], ["giraffe", "🦒"], ["lion", "🦁"], ["tiger", "🐯"], ["bear", "🐻"], ["panda", "🐼"],
    ["koala", "🐨"], ["zebra", "🦓"], ["monkey", "🐵"], ["gorilla", "🦍"], ["camel", "🐫"], ["kangaroo", "🦘"],
    ["rhino", "🦏"], ["hippo", "🦛"],
];
const FARM_AND_PETS: [string, string][] = [
    ["cow", "🐮"], ["pig", "🐷"], ["sheep", "🐑"], ["goat", "🐐"], ["horse", "🐴"], ["chicken", "🐔"],
    ["duck", "🦆"], ["dog", "🐶"], ["cat", "🐱"], ["rabbit", "🐰"], ["mouse", "🐭"],
];
const SEA: [string, string][] = [
    ["fish", "🐟"], ["dolphin", "🐬"], ["whale", "🐳"], ["shark", "🦈"], ["octopus", "🐙"], ["crab", "🦀"],
    ["lobster", "🦞"], ["turtle", "🐢"],
];
const BIRDS_AND_REPTILES: [string, string][] = [
    ["penguin", "🐧"], ["owl", "🦉"], ["eagle", "🦅"], ["parrot", "🦜"], ["swan", "🦢"], ["peacock", "🦚"],
    ["flamingo", "🦩"], ["snake", "🐍"], ["crocodile", "🐊"], ["frog", "🐸"],
];
const SMALL_CREATURES: [string, string][] = [
    ["butterfly", "🦋"], ["bee", "🐝"], ["ladybird", "🐞"], ["spider", "🕷️"], ["snail", "🐌"], ["ant", "🐜"],
    ["hedgehog", "🦔"], ["bat", "🦇"], ["squirrel", "🐿️"], ["deer", "🦌"], ["fox", "🦊"], ["wolf", "🐺"],
];
const FRUIT: [string, string][] = [
    ["apple", "🍎"], ["banana", "🍌"], ["grapes", "🍇"], ["orange", "🍊"], ["strawberry", "🍓"],
    ["watermelon", "🍉"], ["pineapple", "🍍"], ["cherries", "🍒"], ["lemon", "🍋"], ["pear", "🍐"],
    ["peach", "🍑"], ["mango", "🥭"], ["coconut", "🥥"], ["kiwi", "🥝"],
];
const VEGETABLES: [string, string][] = [
    ["carrot", "🥕"], ["tomato", "🍅"], ["potato", "🥔"], ["broccoli", "🥦"], ["corn", "🌽"], ["mushroom", "🍄"],
    ["avocado", "🥑"],
];
const FOOD: [string, string][] = [
    ["pizza", "🍕"], ["burger", "🍔"], ["ice cream", "🍦"], ["cake", "🍰"], ["biscuit", "🍪"], ["bread", "🍞"],
    ["cheese", "🧀"], ["egg", "🥚"], ["popcorn", "🍿"], ["chocolate", "🍫"], ["doughnut", "🍩"], ["pancakes", "🥞"],
];
const VEHICLES: [string, string][] = [
    ["car", "🚗"], ["bus", "🚌"], ["train", "🚆"], ["aeroplane", "✈️"], ["helicopter", "🚁"], ["bicycle", "🚲"],
    ["sailing boat", "⛵"], ["ship", "🚢"], ["rocket", "🚀"], ["tractor", "🚜"], ["fire engine", "🚒"],
    ["ambulance", "🚑"], ["police car", "🚓"], ["taxi", "🚕"],
];
const NATURE: [string, string][] = [
    ["sun", "☀️"], ["moon", "🌙"], ["star", "⭐"], ["cloud", "☁️"], ["rainbow", "🌈"], ["lightning", "⚡"],
    ["tree", "🌳"], ["flower", "🌸"], ["volcano", "🌋"], ["mountain", "⛰️"], ["wave", "🌊"], ["fire", "🔥"],
    ["cactus", "🌵"], ["leaf", "🍃"],
];
const OBJECTS: [string, string][] = [
    ["clock", "⏰"], ["key", "🔑"], ["book", "📖"], ["umbrella", "☂️"], ["bell", "🔔"], ["scissors", "✂️"],
    ["pencil", "✏️"], ["light bulb", "💡"], ["camera", "📷"], ["hat", "🎩"], ["glasses", "👓"], ["football", "⚽"],
    ["drum", "🥁"], ["guitar", "🎸"], ["crown", "👑"], ["balloon", "🎈"], ["present", "🎁"], ["candle", "🕯️"],
    ["house", "🏠"], ["tent", "⛺"], ["castle", "🏰"],
];
const SPELLING: [string, string][] = [
    ["elephant", "🐘"], ["giraffe", "🦒"], ["butterfly", "🦋"], ["banana", "🍌"], ["strawberry", "🍓"],
    ["umbrella", "☂️"], ["helicopter", "🚁"], ["pineapple", "🍍"], ["rainbow", "🌈"], ["penguin", "🐧"],
    ["tomato", "🍅"], ["camera", "📷"], ["rabbit", "🐰"], ["guitar", "🎸"],
];

const FIRST_LETTER: [string, string][] = [
    ["apple", "🍎"], ["ball", "⚽"], ["cat", "🐱"], ["dog", "🐶"], ["elephant", "🐘"], ["fish", "🐟"],
    ["giraffe", "🦒"], ["lion", "🦁"], ["pizza", "🍕"], ["tree", "🌳"], ["umbrella", "☂️"], ["zebra", "🦓"],
];

const LANDMARKS_PHOTO: [string, string][] = [
    ["Eiffel Tower", "Eiffel_Tower"], ["Big Ben", "Big_Ben"], ["Taj Mahal", "Taj_Mahal"],
    ["The Pyramids", "Great_Pyramid_of_Giza"], ["Statue of Liberty", "Statue_of_Liberty"],
    ["Sydney Opera House", "Sydney_Opera_House"], ["Leaning Tower of Pisa", "Leaning_Tower_of_Pisa"],
    ["Great Wall of China", "Great_Wall_of_China"], ["Burj Khalifa", "Burj_Khalifa"], ["Tower Bridge", "Tower_Bridge"],
];

const ANIMALS_PHOTO: [string, string][] = [
    ["giraffe", "Giraffe"], ["lion", "Lion"], ["tiger", "Tiger"], ["zebra", "Zebra"], ["panda", "Giant_panda"],
    ["koala", "Koala"], ["flamingo", "Flamingo"], ["penguin", "Penguin"],
];

export const PICTURES_5_TO_7: PuzzleRow[] = [
    ...identify("Animals", "Which animal is this?", "emoji", ZOO),
    ...identify("Animals", "Which animal is this?", "emoji", FARM_AND_PETS),
    ...identify("Animals", "Which animal is this?", "emoji", SEA),
    ...identify("Animals", "Which animal is this?", "emoji", BIRDS_AND_REPTILES),
    ...identify("Animals", "Which animal is this?", "emoji", SMALL_CREATURES),
    ...identify("Science", "Which fruit is this?", "emoji", FRUIT),
    ...identify("Science", "Which vegetable is this?", "emoji", VEGETABLES),
    ...identify("Language", "What food is this?", "emoji", FOOD),
    ...identify("Language", "Which vehicle is this?", "emoji", VEHICLES),
    ...identify("Science", "What is this?", "emoji", NATURE),
    ...identify("Language", "What is this?", "emoji", OBJECTS),
    ...counting([
        ["🍎", "apples", 3], ["⭐", "stars", 5], ["🐟", "fish", 4], ["🎈", "balloons", 6], ["🐝", "bees", 2],
        ["🍌", "bananas", 7], ["🚗", "cars", 4], ["🦋", "butterflies", 8], ["🌸", "flowers", 9],
    ]),
    ...spellIt(SPELLING),
    ...firstLetter(FIRST_LETTER),
    ...identify("Places", "Which famous place is this?", "photo", LANDMARKS_PHOTO),
    ...identify("Animals", "Which animal is this?", "photo", ANIMALS_PHOTO),
];
