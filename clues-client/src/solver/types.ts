export interface Definition {
  verbalClue: string;
  linguisticClue?: string;
  wordsLength: string[];
  composer: string;
  solution?: string;
}

export type MultiwordDivision = string[];

// Regular division are not used.
export interface RegularDivision {
  firstPart: string[];
  secondPart: string[];
}

export interface AnagramDivision {
  // The first part contains the non-anagram words in the definition
  firstPart: string[];
  // The second part contains the anagram words in the definition
  secondPart: string[];

  anagrams?: string[][];
  sortedAnagramLetters: string;
}

export interface Divisions {
  // An array of multiword-divisions, each array contains array of words
  multiwordDivisions?: MultiwordDivision[];

  // Regular divisions are created (all posible divisions of the definition words),
  // but currently the CRCR-candidates-suggester python script ignore them.
  regularDivisons: RegularDivision[];

  // In anagram divisions, the first part contains words from the "non-anagram" part of the definition,
  // the second part is an array of potential anagrams
  anagramDivisions?: AnagramDivision[];
}

// Data for the CRCR-candidates-suggester python script
// Obviously, the suggester don't use the solution, but it is required for evalutaion stages.
export interface DataForCandidatesSuggester {
  definition: Definition;
  divisions?: Divisions;
}
