import {
  Definition,
  Divisions,
  MultiwordDivision,
  RegularDivision,
} from './types';

import { buildVerbalClueWords } from './parser/verbal-clue-services';

const lamedPrepositionPrefix = 'ל';

const orConjunction = 'או';
const betweenPreposition = 'בין';

// Empty division = one part of the division is empty, the other contains all the words
const removeEmptyDivision = (divisions: RegularDivision[]) => {
  return divisions.slice(1);
};

const isClueContainsOrConjuction = (words: string[]) =>
  words.length > 2 && words.some(word => word === orConjunction);

const isClueContainsBetweenPreposition = (words: string[]) =>
  words.length > 2 && words.some(word => word === betweenPreposition);

const buildOrConjuctionDivision = (words: string[]): string[] => {
  const orConjuctionDivision: string[] = [];
  for (const word of words) {
    if (word !== orConjunction) {
      orConjuctionDivision.push(word);
    }
  }
  return orConjuctionDivision;
};

const isWithLamedPrepositionPrefix = (words: string[], i: number) =>
  i > 1 &&
  words[i - 2] === betweenPreposition &&
  words[i].indexOf(lamedPrepositionPrefix) === 0;

const buildBetweenPrepositionDivision = (words: string[]): string[] => {
  const betweenPrepositionDivision: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (words[i] !== betweenPreposition) {
      const word = isWithLamedPrepositionPrefix(words, i)
        ? words[i].substring(1)
        : words[i];
      betweenPrepositionDivision.push(word);
    }
  }
  return betweenPrepositionDivision;
};

const buildMultiwordDivisions = (words: string[]) => {
  const multiwordDivisions: MultiwordDivision[] = [];

  if (isClueContainsOrConjuction(words)) {
    multiwordDivisions.push(buildOrConjuctionDivision(words));
  } else if (isClueContainsBetweenPreposition(words)) {
    multiwordDivisions.push(buildBetweenPrepositionDivision(words));
  } else {
    multiwordDivisions.push(words);
  }
  return multiwordDivisions;
};

// Create simple divsions - without morphological aspects
export const buildDivisions = (clues: Definition): Divisions => {
  const clueWords = buildVerbalClueWords(clues.verbalClue);

  const multiwordDivisions = buildMultiwordDivisions(clueWords);

  const regularDivisions: RegularDivision[] = clueWords.map(
    (word, index, array) => {
      return {
        firstPart: array.slice(0, index),
        secondPart: array.slice(index, array.length),
      } as RegularDivision;
    },
  );
  const cleanDivisons = removeEmptyDivision(regularDivisions);

  return { multiwordDivisions, regularDivisons: cleanDivisons } as Divisions;
};