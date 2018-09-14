import { candidatesScoresSorter } from './ranking-services';
import {
  AnagramDivisionMeasures,
  // Measure,
  MultiwordDivisionMeasures,
} from './types';
import { DefinitionsCandidatesData, DivisionsMeasures } from './types';

const cosSimularity = 'cosadd';
const cosmulSimularity = 'cosmul';
const unableToCalcFullSimularity = 'unk';

// TD = Titles Dictionary
const titlesBasedTechnique = 'T';

// ME = Multiword Expression
const multiwordExpressionsTechniques = 'ME';

const anagramWordVectorTechniques = 'A';

const titlesMultiwordExpressionsDictionaryTechnique =
  titlesBasedTechnique + '-' + multiwordExpressionsTechniques;
const titlesAnagramsDictionaryTechnique =
  titlesBasedTechnique + '-' + anagramWordVectorTechniques;

const isSolvedByMultiwordSimCosmul = (
  solution: string,
  multiwordDivisions: MultiwordDivisionMeasures[] | undefined,
) =>
  multiwordDivisions &&
  multiwordDivisions.length > 0 &&
  multiwordDivisions[0].mostSimCosmulWords.length > 0 &&
  multiwordDivisions[0].mostSimCosmulWords[0][0] === solution;

const isSolvedByMultiwordSim = (
  solution: string,
  multiwordDivisions: MultiwordDivisionMeasures[] | undefined,
) =>
  multiwordDivisions &&
  multiwordDivisions.length > 0 &&
  multiwordDivisions[0].mostSimWords.length > 0 &&
  multiwordDivisions[0].mostSimWords[0][0] === solution;

const isSolvedByTitlesDictsSim = (
  solution: string,
  multiwordDivisions: MultiwordDivisionMeasures[] | undefined,
) => {
  if (multiwordDivisions && multiwordDivisions.length > 0) {
    const division = multiwordDivisions[0];
    return (
      division.titlesMeasures &&
      division.titlesMeasures.titlesMostSimWords.length > 0 &&
      division.titlesMeasures.titlesMostSimWords[0][0] === solution
    );
  }
  return undefined;
};

const isSolvedByTitlesDictsWithoutSim = (
  solution: string,
  multiwordDivisions: MultiwordDivisionMeasures[] | undefined,
) => {
  if (multiwordDivisions && multiwordDivisions.length > 0) {
    const division = multiwordDivisions[0];

    return (
      division.titlesMeasures &&
      (!division.titlesMeasures.titlesMostSimWords ||
        (division.titlesMeasures.titlesMostSimWords &&
          division.titlesMeasures.titlesMostSimWords.length === 0)) &&
      division.titlesMeasures.titlesWithoutSim &&
      division.titlesMeasures.titlesWithoutSim.length > 0 &&
      division.titlesMeasures.titlesWithoutSim[0][0] === solution
    );
  }
  return undefined;
};

// build multiWord word embedding technique
const getWordEmbeddingTechnique = (divisionsMeasures: DivisionsMeasures) =>
  ((divisionsMeasures as DivisionsMeasures)
    .multiwordDivisionsMeasures as MultiwordDivisionMeasures[])[0]
    .wordEmbeddingTechnique;

const buildMultiwordWvTechniqueName = (
  divisionsMeasures: DivisionsMeasures,
  similarityType: string,
) => {
  const wvFormat = getWordEmbeddingTechnique(divisionsMeasures);
  return wvFormat
    ? multiwordExpressionsTechniques + '-' + wvFormat + '-' + similarityType
    : multiwordExpressionsTechniques + '-' + similarityType;
};

// Multiwords techniques
const getMultiwordSolvingTechniques = (data: DefinitionsCandidatesData) => {
  let techniques = [];
  if (data.definition.solution) {
    if (
      isSolvedByMultiwordSimCosmul(
        data.definition.solution,
        data.divisionsMeasures.multiwordDivisionsMeasures,
      )
    ) {
      const technique = buildMultiwordWvTechniqueName(
        data.divisionsMeasures,
        cosmulSimularity,
      );
      techniques.push(technique);
    }
    if (
      isSolvedByMultiwordSim(
        data.definition.solution,
        data.divisionsMeasures.multiwordDivisionsMeasures,
      )
    ) {
      const technique = buildMultiwordWvTechniqueName(
        data.divisionsMeasures,
        cosSimularity,
      );
      techniques.push(technique);
    }
    if (
      isSolvedByTitlesDictsSim(
        data.definition.solution,
        data.divisionsMeasures.multiwordDivisionsMeasures,
      )
    ) {
      const technique =
        titlesMultiwordExpressionsDictionaryTechnique + '-' + cosSimularity;
      techniques.push(technique);
    } else if (
      data.divisionsMeasures.multiwordDivisionsMeasures &&
      isSolvedByTitlesDictsWithoutSim(
        data.definition.solution,
        data.divisionsMeasures.multiwordDivisionsMeasures,
      )
    ) {
      const technique =
        titlesMultiwordExpressionsDictionaryTechnique +
        '-' +
        unableToCalcFullSimularity;
      techniques.push(technique);
    }
  }
  return techniques;
};

const isSolvedByAnagramCosSim = (
  solution: string,
  anagramDivisionsMeasures?: AnagramDivisionMeasures[],
) => {
  if (anagramDivisionsMeasures && anagramDivisionsMeasures.length > 0) {
    // tslint:disable-next-line:no-any
    let mostSimWords: any[][] = [];
    for (let divisionMeasures of anagramDivisionsMeasures) {
      for (let measure of divisionMeasures.mostSimMeasures) {
        mostSimWords.push(measure);
      }
    }
    if (mostSimWords.length > 0) {
      return mostSimWords.sort(candidatesScoresSorter)[0][0] === solution;
    }
  }
  return false;
};

const isSolvedByAnagramTitlesDictSim = (
  solution: string,
  anagramDivisionsMeasures?: AnagramDivisionMeasures[],
) => {
  if (anagramDivisionsMeasures && anagramDivisionsMeasures.length > 0) {
    // tslint:disable-next-line:no-any
    let titlesMostSimWords: any[][] = [];
    for (let divisionMeasures of anagramDivisionsMeasures) {
      for (let measure of divisionMeasures.titlesMeasures.titlesMostSimWords) {
        titlesMostSimWords.push(measure);
      }
    }
    if (titlesMostSimWords.length > 0) {
      return titlesMostSimWords.sort(candidatesScoresSorter)[0][0] === solution;
    }
  }
  return false;
};

const isSolvedByAnagramTitlesWithoutSim = (
  solution: string,
  anagramDivisionsMeasures?: AnagramDivisionMeasures[],
) => {
  if (anagramDivisionsMeasures && anagramDivisionsMeasures.length > 0) {
    // tslint:disable-next-line:no-any
    let titlesWithoutSim: any[][] = [];
    for (let divisionMeasures of anagramDivisionsMeasures) {
      for (let measure of divisionMeasures.titlesMeasures.titlesWithoutSim) {
        titlesWithoutSim.push(measure);
      }
    }
    if (titlesWithoutSim.length > 0) {
      return titlesWithoutSim.sort(candidatesScoresSorter)[0][0] === solution;
    }
  }
  return false;
};

const getAnagramSolvingTechniques = (data: DefinitionsCandidatesData) => {
  let techniques: string[] = [];
  if (
    data.definition.solution &&
    data.divisionsMeasures.anagramDivisionsMeasures
  ) {
    if (
      isSolvedByAnagramCosSim(
        data.definition.solution,
        data.divisionsMeasures.anagramDivisionsMeasures,
      )
    ) {
      const technique = anagramWordVectorTechniques + '-' + cosSimularity;
      techniques.push(technique);
    }
    if (
      isSolvedByAnagramTitlesDictSim(
        data.definition.solution,
        data.divisionsMeasures.anagramDivisionsMeasures,
      )
    ) {
      const technique = titlesAnagramsDictionaryTechnique + '-' + cosSimularity;
      techniques.push(technique);
    }
    if (
      isSolvedByAnagramTitlesWithoutSim(
        data.definition.solution,
        data.divisionsMeasures.anagramDivisionsMeasures,
      )
    ) {
      const technique =
        titlesAnagramsDictionaryTechnique + '-' + unableToCalcFullSimularity;
      techniques.push(technique);
    }
  }
  return techniques;
};

/**
 * Solving technique name is based on:
 *  Using titles dictionary or word embeddings technique only (fasttext/w2v),
 *  Chosen simularity measure (cosadd/cosmol)
 *  Whetere it's based on MWE or an anagram
 */
export const getSolvingTechinques = (
  data: DefinitionsCandidatesData,
): string[] => {
  let techniques: string[] = [];
  if (data.definition.solution) {
    techniques = getMultiwordSolvingTechniques(data);
    techniques = techniques.concat(getAnagramSolvingTechniques(data));
  }
  return techniques;
};
