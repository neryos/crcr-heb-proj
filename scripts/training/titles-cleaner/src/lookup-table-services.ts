import {
  isWordInHebrewAlphabetCharacters,
  isStopWord,
  cleanDiacriticHebrewSymbols,
} from './hebrew-letters-services';

// Dictionary with words as key, and array of adjacent words, window size = 1.
export interface LookupDict {
  [word: string]: string[];
}

const isWordStartsWithBracket = (word: string) => word.startsWith('(');

const isLookupable = (words: string[]) =>
  words.length > 1 &&
  !isWordStartsWithBracket(words[1]) &&
  isWordInHebrewAlphabetCharacters(words[0]) &&
  isWordInHebrewAlphabetCharacters(words[1]) &&
  !isStopWord(words[1], words.length);

const propagateWord = (
  firstWord: string,
  secondWord: string,
  lookupTable: LookupDict,
) => {
  if (!lookupTable[firstWord]) {
    lookupTable[firstWord] = [secondWord];
  } else if (
    !lookupTable[firstWord].some(adjacentWord => adjacentWord === secondWord)
  ) {
    lookupTable[firstWord].push(secondWord);
  }
};

const addWordsToLookupDict = (
  firstWord: string,
  secondWord: string,
  lookupTable: LookupDict,
) => {
  propagateWord(firstWord, secondWord, lookupTable);
  propagateWord(secondWord, firstWord, lookupTable);
};

// Currently only the first 2 words of a line are treated. Empirically the results are fine.
export const buildLookupDict = (data: string) => {
  const lines = data.split('\n');
  const lookupDict: LookupDict = {};
  for (const line of lines) {
    const words = line
      .split('_')
      .map(value => cleanDiacriticHebrewSymbols(value));

    if (isLookupable(words)) {
      addWordsToLookupDict(words[0], words[1], lookupDict);
    }
  }
  return lookupDict;
};

