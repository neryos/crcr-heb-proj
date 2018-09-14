import { getSentenceLength } from '../parser/words-length-services';

import { hasMorpologicalDiffrenceFrom } from './filter-services';
import { filter } from './filter-services';
import { getSolvingTechinques } from './techniques-services';
import {
  DefinitionEvaluation,
  DefinitionsCandidatesData,
  MultiwordDivisionMeasures,
} from './types';

const topThreshold = 5;

// Filter non-relvant candidates - Gibreish, non hebrew chars, morpholofical inflections
const isDefinitionSolved = (
  solution: string | undefined,
  topFiveCandidates: string[] | undefined,
) =>
  solution &&
  topFiveCandidates &&
  topFiveCandidates.length > 0 &&
  topFiveCandidates[0] === solution;

// Candidates are sorted from top to bottom, array contains at least one item
// Each candidate contains two elements: elem[0] = word, elem[1] = similarity measure
const pickTopUniqueCandidates = (
  // tslint:disable-next-line:no-any
  measureCandidates: any[][],
  existingTopCandidates: string[],
  candidatesSlots: number = topThreshold,
) => {
  const topCandidates: string[] = [];
  for (
    let candidateInd = 0;
    candidateInd < measureCandidates.length && candidateInd < candidatesSlots;
    candidateInd++
  ) {
    const candidateWord = measureCandidates[candidateInd][0];
    if (!existingTopCandidates.some(value => value === candidateWord)) {
      topCandidates.push(candidateWord);
    }
  }
  return topCandidates;
};

const fillSlots = (
  // tslint:disable-next-line:no-any
  candidates: any[][] | undefined,
  existingTopCandidates: string[],
) => {
  if (candidates && candidates.length > 0) {
    const candidatesSlots = topThreshold - existingTopCandidates.length;
    return existingTopCandidates.concat(
      pickTopUniqueCandidates(
        candidates,
        existingTopCandidates,
        candidatesSlots,
      ),
    );
  }
  return existingTopCandidates;
};

const isSlotsOpened = (topFiveCandidates: string[]) =>
  topFiveCandidates && topFiveCandidates.length <= topThreshold;

// tslint:disable:no-any
// Sort in descending order of scores - each candidate element is array with two cells [word, score]
export const candidatesScoresSorter = (element1: any[], element2: any[]) =>
  element2[1] - element1[1];

// Sort in alphabetical order of candidates words
const candidatesWordsSorter = (element1: any[], element2: any[]) =>
  element1[0] - element2[0];

// tslint:disable:no-any
const mergeCopmeteingTechniques = (
  optimizedMostSimCosmulWords: any[][] | undefined,
  anagramDivisionsMeasures: any[][] | undefined,
) => {
  // Both techniques yield candidates
  if (optimizedMostSimCosmulWords && anagramDivisionsMeasures) {
    const mergedCandidates = anagramDivisionsMeasures.concat(
      optimizedMostSimCosmulWords,
    );

    // sort in descending order
    return mergedCandidates.sort(candidatesScoresSorter);
  }

  return optimizedMostSimCosmulWords
    ? optimizedMostSimCosmulWords
    : anagramDivisionsMeasures;
};

const getMwMostSimCosmulWords = (data: DefinitionsCandidatesData) => {
  if (
    data.divisionsMeasures.multiwordDivisionsMeasures &&
    data.divisionsMeasures.multiwordDivisionsMeasures.length > 0
  ) {
    return data.divisionsMeasures.multiwordDivisionsMeasures[0]
      .mostSimCosmulWords;
  }
  return undefined;
};

const getMwMostSimWords = (data: DefinitionsCandidatesData) => {
  if (
    data.divisionsMeasures.multiwordDivisionsMeasures &&
    data.divisionsMeasures.multiwordDivisionsMeasures.length > 0
  ) {
    return data.divisionsMeasures.multiwordDivisionsMeasures[0].mostSimWords;
  }
  return undefined;
};

const getTitlesMostSimWords = (data: DefinitionsCandidatesData) => {
  if (
    data.divisionsMeasures.multiwordDivisionsMeasures &&
    data.divisionsMeasures.multiwordDivisionsMeasures.length > 0 &&
    (data.divisionsMeasures
      .multiwordDivisionsMeasures as MultiwordDivisionMeasures[])[0]
      .titlesMeasures
  ) {
    const mwDivisions = data.divisionsMeasures.multiwordDivisionsMeasures[0];
    if (
      mwDivisions.titlesMeasures &&
      mwDivisions.titlesMeasures.titlesMostSimWords
    ) {
      return mwDivisions.titlesMeasures.titlesMostSimWords;
    }
  }
  return undefined;
};

const getTitlesWithoutSim = (data: DefinitionsCandidatesData) => {
  if (
    data.divisionsMeasures.multiwordDivisionsMeasures &&
    data.divisionsMeasures.multiwordDivisionsMeasures.length > 0 &&
    (data.divisionsMeasures
      .multiwordDivisionsMeasures as MultiwordDivisionMeasures[])[0]
      .titlesMeasures
  ) {
    const mwDivisions = data.divisionsMeasures.multiwordDivisionsMeasures[0];
    if (
      mwDivisions.titlesMeasures &&
      mwDivisions.titlesMeasures.titlesWithoutSim
    ) {
      return mwDivisions.titlesMeasures.titlesWithoutSim.sort(
        candidatesWordsSorter,
      );
    }
  }
  return undefined;
};

const getAnagramTitlesMostSimWords = (data: DefinitionsCandidatesData) => {
  if (
    data.divisionsMeasures.anagramDivisionsMeasures &&
    data.divisionsMeasures.anagramDivisionsMeasures.length > 0
  ) {
    let titlesMostSimWords: any[][] = [];
    for (let division of data.divisionsMeasures.anagramDivisionsMeasures) {
      titlesMostSimWords = titlesMostSimWords.concat(
        division.titlesMeasures.titlesMostSimWords,
      );
      // Add titles with partial similarity
      titlesMostSimWords = titlesMostSimWords.concat(
        division.titlesMeasures.titlesWithoutSim.filter(
          candidate => candidate[1] !== 1,
        ),
      );
    }
    return titlesMostSimWords.sort(candidatesScoresSorter);
  }
  return undefined;
};

const getAnagramTitlesWithoutSimWords = (data: DefinitionsCandidatesData) => {
  if (
    data.divisionsMeasures.anagramDivisionsMeasures &&
    data.divisionsMeasures.anagramDivisionsMeasures.length > 0
  ) {
    let titlesWithoutSimWords: any[][] = [];
    for (let division of data.divisionsMeasures.anagramDivisionsMeasures) {
      titlesWithoutSimWords = titlesWithoutSimWords.concat(
        division.titlesMeasures.titlesWithoutSim.filter(
          candidate => candidate[1] === 1,
        ),
      );
    }
    titlesWithoutSimWords.sort(candidatesWordsSorter);
    return titlesWithoutSimWords;
  }
  return undefined;
};

const calcAnagramScoreWithLengthCofficient = (
  score: number,
  solutionWordsLength: number,
) => score + (solutionWordsLength / 10) * score;

const morphologicalSimilaritiesMapper = (
  candidate: any[],
  verbalClue: string,
) => {
  const hasMorpologicalDifference = (candidate[0] as string)
    .split(' ')
    .every(word => {
      if (word.length > 2) {
        return hasMorpologicalDiffrenceFrom(word, verbalClue);
      }
      return true;
    });
  if (hasMorpologicalDifference) {
    return candidate;
  }
  return [candidate[0] as string, (candidate[1] as number) / 4];
};

const getAnagramMostSimWords = (
  data: DefinitionsCandidatesData,
  isAnagramScoreRecalculated: boolean,
) => {
  if (
    data.divisionsMeasures.anagramDivisionsMeasures &&
    data.divisionsMeasures.anagramDivisionsMeasures.length > 0
  ) {
    let mostSimWords: any[][] = [];

    const solutionWordsLength = getSentenceLength(data.definition.wordsLength);

    for (let division of data.divisionsMeasures.anagramDivisionsMeasures) {
      // Use solution length coefficient to calculate better score for anagrams
      // Use primitive morphology deductions -
      if (isAnagramScoreRecalculated && solutionWordsLength > 4) {
        for (let measure of division.mostSimMeasures) {
          const updatedMeasure = [
            measure[0],
            calcAnagramScoreWithLengthCofficient(
              measure[1],
              solutionWordsLength,
            ),
          ];
          mostSimWords.push(updatedMeasure);
        }
      } else {
        mostSimWords = mostSimWords.concat(division.mostSimMeasures);
      }
    }
    // The vast majority of anagrams tend to be different from the original words structure,
    // Let this observation reflects in the candidates scores
    const updatePrefixMostSimWords = mostSimWords.map(candidate =>
      morphologicalSimilaritiesMapper(candidate, data.definition.verbalClue),
    );

    return updatePrefixMostSimWords.sort(candidatesScoresSorter);
    // return mostSimWords.sort(candidatesScoresSorter);
  }
  return undefined;
};

/**
 * Algorithm, based on empirical results:
 *
 * As long as slots opened, peak elements in the following order:
 *  T-MW-Sim (cosadd) candidates,
 *  T-MW-unk candiadtes (usually it should be empty)
 *  T-A-Sim (cosadd) candiadtes,
 *  T-A-unk candidates,
 *  Anagrams T Sim candiadtes,
 *  Anagrams T unk candiadtes,
 *  Anagrams Sim (cosadd) or Multiword Sim (cosmul) - based on higer scores:
 *    Word vectors SimCosmul based on multiword expressions divisionds , if slots opened -
 *  Multiwords - Word vectors Sim (coassadd) based on multiword expressions divisionds.
 *
 *  If slots are still opened, candidates were not found.
 */
const getTopFiveCandidates = (
  data: DefinitionsCandidatesData,
  isAnagramScoreRecalculated: boolean,
) => {
  if (data.definition.solution) {
    const mwTitlesMostSimWords = getTitlesMostSimWords(data);
    const mwTitlesSharedWordsWithoutSim = getTitlesWithoutSim(data);
    const mwMostSimCosmulWords = getMwMostSimCosmulWords(data);
    const mwMostSimWords = getMwMostSimWords(data);

    const anagramTitlesMostSimWords = getAnagramTitlesMostSimWords(data);
    const anagramTitlesWithoutSimWords = getAnagramTitlesWithoutSimWords(data);
    const anagramMostSimWords = getAnagramMostSimWords(
      data,
      isAnagramScoreRecalculated,
    );

    let topFiveCandidates: string[] = [];

    if (mwTitlesMostSimWords && mwTitlesMostSimWords.length > 0) {
      topFiveCandidates = fillSlots(mwTitlesMostSimWords, topFiveCandidates);
    }
    if (
      isSlotsOpened(topFiveCandidates) &&
      mwTitlesSharedWordsWithoutSim &&
      mwTitlesSharedWordsWithoutSim.length > 0
    ) {
      topFiveCandidates = fillSlots(
        mwTitlesSharedWordsWithoutSim,
        topFiveCandidates,
      );
    }
    if (data.definition.solution.length <= 3) {
      if (isSlotsOpened(topFiveCandidates)) {
        const mergedCandiataes = mergeCopmeteingTechniques(
          mwMostSimCosmulWords,
          anagramTitlesMostSimWords,
        );
        topFiveCandidates = fillSlots(mergedCandiataes, topFiveCandidates);
      }
      if (isSlotsOpened(topFiveCandidates) && anagramTitlesWithoutSimWords) {
        topFiveCandidates = fillSlots(
          anagramTitlesWithoutSimWords,
          topFiveCandidates,
        );
      }
    } else {
      if (isSlotsOpened(topFiveCandidates) && anagramTitlesMostSimWords) {
        topFiveCandidates = fillSlots(
          anagramTitlesMostSimWords,
          topFiveCandidates,
        );
      }
      if (isSlotsOpened(topFiveCandidates) && anagramTitlesWithoutSimWords) {
        topFiveCandidates = fillSlots(
          anagramTitlesWithoutSimWords,
          topFiveCandidates,
        );
      }
      if (isSlotsOpened(topFiveCandidates)) {
        const mergedCandiataes = mergeCopmeteingTechniques(
          mwMostSimCosmulWords,
          anagramMostSimWords,
        );
        topFiveCandidates = fillSlots(mergedCandiataes, topFiveCandidates);
      }
      if (
        isSlotsOpened(topFiveCandidates) &&
        mwMostSimCosmulWords &&
        mwMostSimCosmulWords.length > 0
      ) {
        topFiveCandidates = fillSlots(mwMostSimCosmulWords, topFiveCandidates);
      }
    }
    if (
      isSlotsOpened(topFiveCandidates) &&
      mwMostSimWords &&
      mwMostSimWords.length > 0
    ) {
      topFiveCandidates = fillSlots(mwMostSimWords, topFiveCandidates);
    }
    return topFiveCandidates;
  }
  return undefined;
};

// Rank the candidates that were created by the script
// Top element in top-five candidates array is the proposed solution
export const rank = (
  data: DefinitionsCandidatesData[],
  isAnagramScoreRecalculated: boolean
): DefinitionEvaluation[] => {
  const definitionEvaluations: DefinitionEvaluation[] = data.map(
    (definitionData: DefinitionsCandidatesData, index: number) => {
      // Definition data for display
      const id = index;
      const verbalClue = definitionData.definition.verbalClue;
      const composer = definitionData.definition.composer;
      const solution = definitionData.definition.solution;

      /**
       *  Proposed candidates, list of all solving techinqeus
       *  Filter candidates suggestions, and peak only candidate with higher probabilty
       */
      const filteredData = filter(definitionData);
      const techniques = getSolvingTechinques(filteredData);
      const topFiveCandidates = getTopFiveCandidates(
        filteredData,
        isAnagramScoreRecalculated,
      );
      const isSolved = isDefinitionSolved(solution, topFiveCandidates);

      return {
        id,
        verbalClue,
        composer,
        solution,
        isSolved,
        techniques,
        topFiveCandidates: topFiveCandidates ? topFiveCandidates : [],
      } as DefinitionEvaluation;
    },
  );

  return definitionEvaluations;
};
