import {
  isWithPrefixVariation,
  isWordInHebrewAlphabetCharacters,
} from '../parser/hebrew-letters-services';
import { buildVerbalClueWords } from '../parser/verbal-clue-services';

import {
  AnagramDivisionMeasures,
  DefinitionsCandidatesData,
  MultiwordDivisionMeasures,
  RegularDivisionMeasures,
  SingleWordMeasures,
  TitlesMeasures,
} from './types';

// Primitive analysis of word features and morphemes
export const hasMorpologicalDiffrenceFrom = (
  candidateWord: string,
  verbalClue: string,
) => {
  const clueWords = buildVerbalClueWords(verbalClue);
  for (let clueWord of clueWords) {
    // Primitive filters
    // A better way is to use a morphological decomposer and based the decision on probability
    // Unfortunately, compiling yap on client side js was problematic,
    // so I decided not to use it for now.

    if (clueWord.length + 1 === candidateWord.length) {
      if (isWithPrefixVariation(clueWord, candidateWord)) {
        // too similar
        return false;
      }
    }
    if (candidateWord.length + 1 === clueWord.length) {
      if (isWithPrefixVariation(candidateWord, clueWord)) {
        // too similar
        return false;
      }
    }
    if (clueWord.length > 2 && clueWord === candidateWord) {
      return false;
    }
  }
  // Keep the candidate
  return true;
};

// Candidate that doesn't pass the filters is thorwn out
const isMultiwordCandidatePassesFilters = (
  candidateWord: string,
  verbalClue: string,
) =>
  isWordInHebrewAlphabetCharacters(candidateWord) &&
  hasMorpologicalDiffrenceFrom(candidateWord, verbalClue);

// Split candidate to words based on space separator
const isTitleCandidatePassesFilter = (candidateWord: string) =>
  candidateWord
    .split(' ')
    .every(word => isWordInHebrewAlphabetCharacters(word));

const isCandidateWordsContainedInDefinition = (
  candidateWordStr: string,
  verbalClue: string,
) => {
  const clueWords = buildVerbalClueWords(verbalClue);
  const candidateWords = buildVerbalClueWords(candidateWordStr);
  return candidateWords.every(candidateWord =>
    clueWords.some(clueWord => clueWord === candidateWord),
  );
};

// Split candidate to words based on space separator
const isAnagramCandidatePassesFilter = (
  candidateWord: string,
  verbalClue: string,
) =>
  candidateWord
    .split(' ')
    .every(word => isWordInHebrewAlphabetCharacters(word)) &&
  !isCandidateWordsContainedInDefinition(candidateWord, verbalClue);

const initFilteredMultiwordDivision = () =>
  ({
    mostSimWords: [],
    mostSimCosmulWords: [],
    singleWordMeasures: [],
  } as MultiwordDivisionMeasures);

const initFilteredSingleWordMeasure = (word: string) =>
  ({
    mostSimCosmulWords: [],
    mostSimWords: [],
    word,
  } as SingleWordMeasures);

const initFilteredTitlesMeasures = () =>
  ({
    titlesMostSimWords: [],
    titlesWithoutSim: [],
  } as TitlesMeasures);

const filterTitlesMeasures = (
  titlesMeasures: TitlesMeasures,
): TitlesMeasures => {
  let filteredMeasures = initFilteredTitlesMeasures();
  if (titlesMeasures.titlesMostSimWords) {
    for (let candidate of titlesMeasures.titlesMostSimWords) {
      if (isTitleCandidatePassesFilter(candidate[0])) {
        filteredMeasures.titlesMostSimWords.push(candidate);
      }
    }
  }
  if (titlesMeasures.titlesWithoutSim) {
    for (let candidate of titlesMeasures.titlesWithoutSim) {
      if (isTitleCandidatePassesFilter(candidate[0])) {
        filteredMeasures.titlesWithoutSim.push(candidate);
      }
    }
  }
  return filteredMeasures;
};

const filterMultiwordDivisions = (
  data: DefinitionsCandidatesData,
): MultiwordDivisionMeasures[] => {
  const filteredMultiwordDivisionsMeasures: MultiwordDivisionMeasures[] = [];

  // A reference to the multiword divisions collection for convenience
  const multiwordDivisionsMeasures = data.divisionsMeasures
    .multiwordDivisionsMeasures as MultiwordDivisionMeasures[];

  // copy multiword divisions measures
  for (let divisionMeasure of multiwordDivisionsMeasures) {
    let filteredMeasures = initFilteredMultiwordDivision();

    if (divisionMeasure.mostSimCosmulWords) {
      // Copy similarity measures of relathinship between words
      for (let candidate of divisionMeasure.mostSimWords) {
        if (
          isMultiwordCandidatePassesFilters(
            candidate[0],
            data.definition.verbalClue,
          )
        ) {
          filteredMeasures.mostSimWords.push(candidate);
        }
      }
      for (let candidate of divisionMeasure.mostSimCosmulWords) {
        if (
          isMultiwordCandidatePassesFilters(
            candidate[0],
            data.definition.verbalClue,
          )
        ) {
          filteredMeasures.mostSimCosmulWords.push(candidate);
        }
      }
      if (divisionMeasure.distance) {
        filteredMeasures.distance = divisionMeasure.distance;
      }
      if (divisionMeasure.wordEmbeddingTechnique) {
        filteredMeasures.wordEmbeddingTechnique =
          divisionMeasure.wordEmbeddingTechnique;
      }

      // Copy general similarity measures for each word in the sentence (knn)
      for (let singleWordMeasure of divisionMeasure.singleWordMeasures) {
        const filterdSingleWordMeasure = initFilteredSingleWordMeasure(
          singleWordMeasure.word,
        );
        for (let candidate of singleWordMeasure.mostSimCosmulWords) {
          if (
            isMultiwordCandidatePassesFilters(
              candidate[0],
              data.definition.verbalClue,
            )
          ) {
            filterdSingleWordMeasure.mostSimCosmulWords.push(candidate);
          }
        }
        for (let candidate of singleWordMeasure.mostSimWords) {
          if (
            isMultiwordCandidatePassesFilters(
              candidate[0],
              data.definition.verbalClue,
            )
          ) {
            filterdSingleWordMeasure.mostSimWords.push(candidate);
          }
        }
        filteredMeasures.singleWordMeasures.push(filterdSingleWordMeasure);
      }
      if (divisionMeasure.titlesMeasures) {
        filteredMeasures.titlesMeasures = filterTitlesMeasures(
          divisionMeasure.titlesMeasures,
        );
      }
    }

    filteredMultiwordDivisionsMeasures.push(filteredMeasures);
  }
  return filteredMultiwordDivisionsMeasures;
};

const filterRegularDivisions = (
  data: DefinitionsCandidatesData,
): RegularDivisionMeasures[] => {
  // Currently regular divsions are not used in the CRCR-candidates-suggester script
  const regularDivisions: RegularDivisionMeasures[] = [];
  return regularDivisions;
};

const initFilteredAnagramDivision = () =>
  ({
    clueWords: [],
    mostSimMeasures: [],
    titlesMeasures: {
      titlesMostSimWords: [],
      titlesWithoutSim: [],
    },
  } as AnagramDivisionMeasures);

const filterAnagramDivisions = (data: DefinitionsCandidatesData) => {
  let filteredAnagramDivisionMeasures: AnagramDivisionMeasures[] = [];

  if (data.divisionsMeasures.anagramDivisionsMeasures) {
    for (let divisionMeasure of data.divisionsMeasures
      .anagramDivisionsMeasures) {
      let filteredMeasures = initFilteredAnagramDivision();
      // copy clue words
      filteredMeasures.clueWords = divisionMeasure.clueWords;
      // copy most sim candidates
      for (let candidate of divisionMeasure.mostSimMeasures) {
        if (
          isAnagramCandidatePassesFilter(
            candidate[0],
            data.definition.verbalClue,
          )
        ) {
          filteredMeasures.mostSimMeasures.push(candidate);
        }
      }
      // copy titles based measures
      if (divisionMeasure.titlesMeasures) {
        if (divisionMeasure.titlesMeasures.titlesMostSimWords) {
          for (let candidate of divisionMeasure.titlesMeasures
            .titlesMostSimWords) {
            if (
              isAnagramCandidatePassesFilter(
                candidate[0],
                data.definition.verbalClue,
              )
            ) {
              filteredMeasures.titlesMeasures.titlesMostSimWords.push(
                candidate,
              );
            }
          }
        }
        if (divisionMeasure.titlesMeasures.titlesWithoutSim) {
          for (let candidate of divisionMeasure.titlesMeasures
            .titlesWithoutSim) {
            if (
              isAnagramCandidatePassesFilter(
                candidate[0],
                data.definition.verbalClue,
              )
            ) {
              filteredMeasures.titlesMeasures.titlesWithoutSim.push(candidate);
            }
          }
        }
      }
      filteredAnagramDivisionMeasures.push(filteredMeasures);
    }
  }
  return filteredAnagramDivisionMeasures;
};

const initDefinitionsCandidatesData = (data: DefinitionsCandidatesData) => {
  return {
    definition: data.definition,
    divisionsMeasures: {},
  } as DefinitionsCandidatesData;
};

// Create a filtered copy of the candidates data
// Itreate over all the nested candidates in the divisions
export const filter = (
  data: DefinitionsCandidatesData,
): DefinitionsCandidatesData => {
  const filteredData = initDefinitionsCandidatesData(data);

  if (data.divisionsMeasures.multiwordDivisionsMeasures) {
    filteredData.divisionsMeasures.multiwordDivisionsMeasures = filterMultiwordDivisions(
      data,
    );
  }
  if (data.divisionsMeasures.regularDivisionsMeasures) {
    filteredData.divisionsMeasures.regularDivisionsMeasures = filterRegularDivisions(
      data,
    );
  }

  if (data.divisionsMeasures.anagramDivisionsMeasures) {
    filteredData.divisionsMeasures.anagramDivisionsMeasures = filterAnagramDivisions(
      data,
    );
  }

  return filteredData;
};
