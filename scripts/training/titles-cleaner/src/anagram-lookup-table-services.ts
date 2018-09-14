import {
  isWordInHebrewAlphabetCharacters,
  cleanDiacriticHebrewSymbols,
  getRegularFormOfLetter,
  converDigitInToHebrewLetters,
  isDigit,
} from './hebrew-letters-services';

// Each key is a sorted alphabetical string, maped to titles with matching letters
export interface LookupDictAnagram {
  [word: string]: string[];
}

// Remove spaces, join as one word, split to letters,
// normalized each letters, sort in alphabetical order, and join again to one word
const getAnagramSortedForm = (words: string) =>
  words
    .split(' ')
    .join('')
    .split('')
    .map(letter => getRegularFormOfLetter(letter))
    .sort()
    .join('');

const isSecondWord = (index: number) => index === 1;

// In Wikipedia titles, sometimes hebrew words are written with numbers
// Is word in hebrew alphabet, or the second word is written as a digit ()
const isWordInExtendedHebrew = (words: string[], index: number) =>
  isWordInHebrewAlphabetCharacters(words[index]) ||
  (isSecondWord(index) && isDigit(words[index]));

// Clean titles - in each title, remove all words after a word with non-hebrew letter was detected
const clean = (titlesWords: string[][]) => {
  return titlesWords
    .filter(words => words.length !== 0)
    .map((words: string[]) => {
      const cleanWords = [];
      for (
        let i = 0;
        i < words.length && isWordInExtendedHebrew(words, i);
        i++
      ) {
        if (isSecondWord(i)) {
          cleanWords.push(converDigitInToHebrewLetters(words[i]));
        } else {
          cleanWords.push(words[i]);
        }
      }
      return cleanWords.join(' ');
    });
};

export const buildLookupDictAnagram = (data: string) => {
  const lines = data.split('\n');

  const normalizedLines = lines.map(line =>
    cleanDiacriticHebrewSymbols(line)
      .split('_')
      .map(value => cleanDiacriticHebrewSymbols(value)),
  );

  const cleanTitlesNames = clean(normalizedLines);

  const lookupDict: LookupDictAnagram = {};
  for (const title of cleanTitlesNames) {
    const anagramForm = getAnagramSortedForm(title);
    if (!lookupDict[anagramForm]) {
      lookupDict[anagramForm] = [title];
    } else if (!lookupDict[anagramForm].some(value => value === title)) {
      lookupDict[anagramForm].push(title);
    }
  }

  return lookupDict;
};
