import { Definition } from '../types';

// The word vector creates array of measures with 2 elements: element 0 = word, element 1 = measure value
// tslint:disable-next-line:no-any
export type Measure = any[];

export interface SingleWordMeasures {
  word: string;
  mostSimWords: Measure[];
  mostSimCosmulWords: Measure[];
}

export interface TitlesMeasures {
  titlesMostSimWords: Measure[];
  titlesWithoutSim: Measure[];
}

export interface MultiwordDivisionMeasures {
  mostSimWords: Measure[];
  mostSimCosmulWords: Measure[];
  singleWordMeasures: SingleWordMeasures[];
  wordEmbeddingTechnique?: string;
  titlesMeasures?: TitlesMeasures;

  // Backward compatibility with earlier expriments, it's no longer used
  distance?: number;
}

export interface RegularDivisionMeasures {}

export interface AnagramDivisionMeasures {
  clueWords: string[];
  mostSimMeasures: Measure[];
  titlesMeasures: TitlesMeasures;
}

export interface DivisionsMeasures {
  multiwordDivisionsMeasures?: MultiwordDivisionMeasures[];
  regularDivisionsMeasures?: RegularDivisionMeasures[];
  anagramDivisionsMeasures?: AnagramDivisionMeasures[];
}

export interface DefinitionsCandidatesData {
  definition: Definition;
  divisionsMeasures: DivisionsMeasures;
}

// Evaluation types
export interface DefinitionEvaluation {
  id: number;
  verbalClue: string;
  composer: string;
  solution: string;
  isSolved: boolean;
  techniques: string[];
  topFiveCandidates: string[];
}

export interface GlobalEvaluation {
  definitionsAmount: number;
  solvedAmount: number;
  topFiveAmount: number;
  successRate?: number;
  topFiveCandidatesRate?: number;
  wordsWithoutCandidates: number;
}
