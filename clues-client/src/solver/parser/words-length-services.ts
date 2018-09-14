// Parse the string as decimal number
const sum = (num1: number, num2: string) => num1 + parseInt(num2, 10);

export const getSentenceLength = (wordsLength: string[]) => wordsLength.reduce(sum, 0);
