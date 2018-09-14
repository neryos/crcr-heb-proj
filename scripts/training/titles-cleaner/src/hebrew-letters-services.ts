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

export const isWordInHebrewAlphabetCharacters = (word: string) =>
  word
    .split('')
    .every((letter: string) => hebChars.some(hebChar => hebChar === letter));

const isWordHyphen = (word: string) => word === '-';

export const isStopWord = (word: string, sentenceLength: number) =>
  sentenceLength !== 2 &&
  (word === 'של' || word === 'או' || isWordHyphen(word));

export const cleanDiacriticHebrewSymbols = (word: string) =>
  word.replace(/['"״׳`]/g, '');

export const isDigit = (word: string) =>
  word === '0' ||
  word === '1' ||
  word === '2' ||
  word === '3' ||
  word === '4' ||
  word === '5' ||
  word === '6' ||
  word === '7' ||
  word === '8' ||
  word === '9';

// Use feminine form (in some cases it's should be in a masculine form, ignore them )
export const converDigitInToHebrewLetters = (text: string) => {
  if (text === '1') {
    return 'אחת';
  } else if (text === '2') {
    return 'שתיים';
  } else if (text === '3') {
    return 'שלוש';
  } else if (text === '4') {
    return 'ארבע';
  } else if (text === '5') {
    return 'חמש';
  } else if (text === '6') {
    return 'שש';
  } else if (text === '7') {
    return 'שבע';
  } else if (text === '8') {
    return 'שמונה';
  } else if (text === '9') {
    return 'תשע';
  } else if (text === '0') {
    return 'אפס';
  }
  return text;
};
