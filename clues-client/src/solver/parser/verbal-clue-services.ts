const wordSeparator = ' ';

const removeExtraSpaces = (text: string) => text.replace(/\s\s+/g, ' ');

const convertHyphenSeparatorToSpace = (text: string) =>
  text.replace(/ - /g, ' ');

// In some cases hyphen is used as a space
const normalizeWordsSeparators = (verbalClue: string) => {
  return removeExtraSpaces(convertHyphenSeparatorToSpace(verbalClue));
};

const cleanPunctuationMarks = (text: string) => text.replace(/[,.?!:]/g, '');

const cleanQuotationMarks = (text: string) => text.replace(/["'״`]/g, '');

// In rare cases the punctuation marks are part of the clue - currently this won't be treated
const clean = (word: string) => {
  const withoutPunctuationMarks = cleanPunctuationMarks(word);
  const withoutQuotationMarks = cleanQuotationMarks(withoutPunctuationMarks);
  return withoutQuotationMarks;
};

export const buildVerbalClueWords = (verbalClue: string): string[] => {
  const normalizedVerbalClue = normalizeWordsSeparators(verbalClue);
  return normalizedVerbalClue.split(wordSeparator).map(word => clean(word));
};
