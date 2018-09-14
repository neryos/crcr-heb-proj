// Sometimes, the final form of Kaf and Pe is the same as the regular form.
// Such cases are currently nor treated.
export const getFinalFormOfLetter = (letter: string) => {
  if (letter === 'מ') {
    return 'ם';
  } else if (letter === 'נ') {
    return 'ן';
  } else if (letter === 'צ') {
    return 'ץ';
  } else if (letter === 'פ') {
    return 'ף';
  } else if (letter === 'כ') {
    return 'ך';
  }
  return letter;
};

export const getRegularFormOfLetter = (letter: string) => {
  if (letter === 'ם') {
    return 'מ';
  } else if (letter === 'ן') {
    return 'נ';
  } else if (letter === 'ץ') {
    return 'צ';
  } else if (letter === 'ף') {
    return 'פ';
  } else if (letter === 'ך') {
    return 'כ';
  }
  return letter;
};

// tslint:disable-next-line:max-line-length
const hebChars = [
  'א',
  'ב',
  'ג',
  'ד',
  'ה',
  'ו',
  'ז',
  'ח',
  'ט',
  'י',
  'י',
  'כ',
  'ך',
  'ל',
  'מ',
  'ם',
  'נ',
  'ן',
  'ס',
  'ע',
  'פ',
  'ף',
  'צ',
  'ץ',
  'ק',
  'ר',
  'ש',
  'ת',
];

export const isWordInHebrewAlphabetCharacters = (word: string) =>
  word
    .split('')
    .every((letter: string) => hebChars.some(hebChar => hebChar === letter));

// Prefix letter (Otiot HaShimush)
// This function is a primitive alternative to morphological decomposer
const isPrefixLetter = (letter: string) =>
  letter === 'מ' ||
  letter === 'ש' ||
  letter === 'ה' ||
  letter === 'ו' ||
  letter === 'כ' ||
  letter === 'ל' ||
  letter === 'ב';

export const isWithPrefixVariation = (baseWord: string, wordToCheck: string) =>
  wordToCheck.substring(1) === baseWord && isPrefixLetter(wordToCheck[0]);
