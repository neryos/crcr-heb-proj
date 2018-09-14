import {
  getFinalFormOfLetter,
  getRegularFormOfLetter,
} from './parser/hebrew-letters-services';
import { buildVerbalClueWords } from './parser/verbal-clue-services';
import { AnagramDivision, Definition, RegularDivision } from './types';

import { getSentenceLength } from './parser/words-length-services';

const maxLengthForAnagrams = 7;

const removeSpaces = (words: string[]) => words.join('');

const getCharacters = (word: string): string[] => word.split('');

const replaceFinalLetters = (text: string) => {
  let regualarFormOfText = '';
  for (let i = 0; i < text.length; i++) {
    regualarFormOfText = regualarFormOfText.concat(
      getRegularFormOfLetter(text[i]),
    );
  }
  return regualarFormOfText;
};

const replaceRegularFormOfFinalLetter = (word: string) => {
  const form = word
    .slice(0, -1)
    .concat(getFinalFormOfLetter(word[word.length - 1]));
  return form;
};

// Builds all possible permutions of a given characters array
// This function implements Heap's Algorithm (see Wikipedia) using JS generator functions and yields
function* permute(
  characters: string[],
  n: number = characters.length,
  // tslint:disable-next-line:no-any
): any {
  if (n <= 1) {
    // yield a shallow copy of the characters array
    yield characters.slice();
  } else {
    for (let i = 0; i < n; i++) {
      yield* permute(characters, n - 1);
      // Swap elements in the characters array
      if (n % 2 === 0) {
        [characters[n - 1], characters[i]] = [characters[i], characters[n - 1]];
      } else {
        [characters[n - 1], characters[0]] = [characters[0], characters[n - 1]];
      }
    }
  }
}

const uniquify = (values: string[]) => Array.from(new Set(values));

const createUniquePermutations = (text: string) => {
  const permutations: string[] = Array.from(permute(getCharacters(text))).map(
    (letters: string[]) => letters.join(''),
  );
  return uniquify(permutations);
};

const segmentizePermutations = (
  permutations: string[],
  wordsLength: number[],
) =>
  permutations.map(rawPermutation => {
    const segmantizedPermutation: string[] = [];
    let segmentationIndex = 0;
    for (const length of wordsLength) {
      const segment = rawPermutation.slice(
        segmentationIndex,
        segmentationIndex + length,
      );
      segmantizedPermutation.push(segment);
      segmentationIndex = segmentationIndex + length;
    }
    return segmantizedPermutation;
  });

/**
 * Create anagrmas from hebrew letters.
 * The function receives a list of words and the required length of each anagram words.
 * It creates a list of all possible uniques anagrams matching that format.
 * The function handles letters with final form of the letters.
 *
 * Cases that are currently not treated:
 *  1. Irregular words that ends with regular forms Kaf and Pe - such as Telescope, Scoop
 *  2. Acronym words that contains Gershaim - such as Tsahal,
 *      The cleaning script of the trainig text for the word vectors removes most of the Gershaim,
 *      so this is a small issue.
 *  3. Words that contains letters with Geresh - Gimel, Zayin, Tsadi
 */
const createHebrewAnagrams = (
  words: string[],
  anagramWordsLength: number[],
): string[][] => {
  const letters = removeSpaces(words);
  const regualrFormOfLetters = replaceFinalLetters(letters);
  const permutations = createUniquePermutations(regualrFormOfLetters).filter(
    value => value !== regualrFormOfLetters,
  );

  const segmentedPermutations = segmentizePermutations(
    permutations,
    anagramWordsLength,
  );

  // Handle the finale forms of letters in the permutations
  // After normalization, re-ordering of the original words could be discovered.
  // The ranker will ignore cases in which the candidate words appear in the definition (shuffles cases).
  const normalizedHebrewPermutations = segmentedPermutations.map(wordsGroup =>
    wordsGroup.map(word => replaceRegularFormOfFinalLetter(word)),
  );

  return normalizedHebrewPermutations;
};

interface SubString {
  start: number;
  end: number;
}

// Algorithm: scan the definition and find potential sub-strings in the verbal clue
// that match the answer length
const findPotentialAnagramsWordGroupsInVerbalClue = (
  words: string[],
  answerLength: number,
): SubString[] => {
  let wordsGroups: SubString[] = [];

  // start index of potential anagram to the answer
  let fromInd = 0;
  // length of words in the group in positions [start, current]
  let groupLength = 0;

  for (let currentInd = 0; currentInd < words.length; currentInd++) {
    groupLength = groupLength + words[currentInd].length;
    while (groupLength > answerLength && fromInd <= currentInd) {
      groupLength = groupLength - words[fromInd].length;
      fromInd++;
    }
    if (groupLength === answerLength) {
      wordsGroups.push({ start: fromInd, end: currentInd } as SubString);
      groupLength = groupLength - words[fromInd].length;
      fromInd++;
    }
    // In case of words group ength < answer length - do nothing, fromInd remains the same
  }
  return wordsGroups;
};

const isWordLengthAllowAnagrams = (clues: Definition) => {
  const solutionLength = getSentenceLength(clues.wordsLength);
  return solutionLength <= maxLengthForAnagrams;
};

const createSortedSegment = (words: string[]) =>
  getCharacters(removeSpaces(words))
    .map(letter => getRegularFormOfLetter(letter))
    .sort()
    .join('');

/* 
Create division with a part containing potential anagram matching words (= second part),
  and another part containing all other words (= first part).
  Words groups - indecies representation of possible anagram divisions in the definition
*/
const createPotentialAnagramsDivisions = (
  clueWords: string[],
  wordsGroups: SubString[],
) => {
  return wordsGroups.map(words => {
    // First part - the non anagram part of the definition
    // Second part - the words in the anagrams part
    const firstPart = clueWords
      .slice(0, words.start)
      .concat(clueWords.slice(words.end + 1, clueWords.length));
    const secondPart = clueWords.slice(words.start, words.end + 1);
    const sortedAnagramLetters = createSortedSegment(secondPart);
    return {
      firstPart,
      secondPart,
      sortedAnagramLetters,
    } as AnagramDivision;
  });
};

const extendDivisionsWithAnagrams = (
  initialDivisions: RegularDivision[],
  wordsLength: number[],
): AnagramDivision[] => {
  return initialDivisions.map(division => {
    return {
      ...division,
      anagrams: createHebrewAnagrams(division.secondPart, wordsLength),
    } as AnagramDivision;
  });
};

export const buildAnagramsDivisions = (definition: Definition) => {
  const clueWords = buildVerbalClueWords(definition.verbalClue);
  const solutionLength = getSentenceLength(definition.wordsLength);

  // Indexes representing positions of potential anagrams to the solution in the definition
  const wordsGroups = findPotentialAnagramsWordGroupsInVerbalClue(
    clueWords,
    solutionLength,
  );

  const initialDivisions = createPotentialAnagramsDivisions(
    clueWords,
    wordsGroups,
  );

  // For segment with n letters, the number of anagrams is n!, so create anagrams only if the solution is short
  // If the length of the solution is longer from the threshold,
  // the CRCR candidates suggestor will use only anagrams that are based on pre-made dicitionary

  if (isWordLengthAllowAnagrams(definition)) {
    // Find all matching anagrams in each divisions
    const anagramDivisions = extendDivisionsWithAnagrams(
      initialDivisions,
      definition.wordsLength.map(Number),
    );
    return anagramDivisions;
  }

  return initialDivisions;
};
