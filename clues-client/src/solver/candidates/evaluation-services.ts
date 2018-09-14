import { DefinitionEvaluation, GlobalEvaluation } from './types';

const updateDefinitionsAmount = (acc: GlobalEvaluation) =>
  acc.definitionsAmount + 1;

const updateSolvedAmount = (
  acc: GlobalEvaluation,
  current: DefinitionEvaluation,
) => (current.isSolved ? acc.solvedAmount + 1 : acc.solvedAmount);

const updateTopFiveAmount = (
  acc: GlobalEvaluation,
  current: DefinitionEvaluation,
) =>
  current.topFiveCandidates.some(value => value === current.solution)
    ? acc.topFiveAmount + 1
    : acc.topFiveAmount;

const updateWordsWithoutCandidates = (
  acc: GlobalEvaluation,
  current: DefinitionEvaluation,
) =>
  current.topFiveCandidates.length === 0
    ? acc.wordsWithoutCandidates + 1
    : acc.wordsWithoutCandidates;

const initGlobalEvaluation = () =>
  ({
    definitionsAmount: 0,
    solvedAmount: 0,
    topFiveAmount: 0,
    wordsWithoutCandidates: 0,
  } as GlobalEvaluation);

const calcSuccessRate = (globalEval: GlobalEvaluation) =>
  globalEval.definitionsAmount !== 0
    ? parseFloat(
        (
          (globalEval.solvedAmount / globalEval.definitionsAmount) *
          100
        ).toFixed(2),
      )
    : undefined;

const calcTopFiveCandidatesRate = (globalEval: GlobalEvaluation) =>
  globalEval.definitionsAmount !== 0
    ? parseFloat(
        (
          (globalEval.topFiveAmount / globalEval.definitionsAmount) *
          100
        ).toFixed(2),
      )
    : undefined;

// tslint:disable-next-line:no-any
export const evaluate = (
  rankedCandidates: DefinitionEvaluation[],
): GlobalEvaluation => {
  let globalEval = rankedCandidates.reduce<GlobalEvaluation>(
    (acc: GlobalEvaluation, current: DefinitionEvaluation) => {
      acc.definitionsAmount = updateDefinitionsAmount(acc);
      acc.solvedAmount = updateSolvedAmount(acc, current);
      acc.topFiveAmount = updateTopFiveAmount(acc, current);
      acc.wordsWithoutCandidates = updateWordsWithoutCandidates(acc, current);
      return acc;
    },
    initGlobalEvaluation(),
  );

  globalEval.successRate = calcSuccessRate(globalEval);
  globalEval.topFiveCandidatesRate = calcTopFiveCandidatesRate(globalEval);

  return globalEval;
};
