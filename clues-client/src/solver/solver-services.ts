import { buildAnagramsDivisions } from './anagrams-services';
import { buildDivisions } from './divider-services';
import { DataForCandidatesSuggester, Definition } from './types';

export const prepareForSolver = (definition: Definition) => {
  const nonAnagramsDivisions = buildDivisions(definition);
  const anagramDivisions = buildAnagramsDivisions(definition);
  
  return {
    divisions: {
      ...nonAnagramsDivisions,
      anagramDivisions:
        anagramDivisions && anagramDivisions.length > 0
          ? anagramDivisions
          : undefined,
    },
    definition,
  } as DataForCandidatesSuggester;
};
