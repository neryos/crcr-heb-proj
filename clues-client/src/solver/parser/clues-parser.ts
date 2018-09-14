import { Definition } from '../types';

const solutionSeparator = ') - ';
const wordsLengthSeparator = ', ';

const wordsLengthOffset = 3;

const removeLastCharacter = (text: string) => text.slice(0, -1);
const removeSpacePadding = removeLastCharacter;

const splitCluesParts = (definitionParts: string[]) =>
  definitionParts[0].split(/[()]/);

const parseCluesParts = (definitionParts: string[]) => {
  const rawClues = splitCluesParts(definitionParts);
  if (rawClues.length > 2) {
    const verbalClue = removeSpacePadding(rawClues[0]);
    const linguisticClue = rawClues.length > 4 ? rawClues[1] : undefined;
    const wordsLength = rawClues[rawClues.length - wordsLengthOffset].split(
      wordsLengthSeparator,
    );

    const composer = rawClues[rawClues.length - 1];

    return { verbalClue, linguisticClue, wordsLength, composer };
  }
  return undefined;
};

const splitSolutionFromClues = (text: string) => text.split(solutionSeparator);

const parseSolution = (definitionParts: string[]) =>
  definitionParts[1] ? definitionParts[1] : undefined;

export const parse = (text: string): Definition | undefined => {
  const definitionParts = splitSolutionFromClues(text);
  const clues = parseCluesParts(definitionParts);
  const solution = parseSolution(definitionParts);

  return clues ? { ...clues, solution } : undefined;
};
