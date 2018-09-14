import * as express from 'express';
import * as fs from 'fs';
import {
  buildLookupDictAnagram,
  LookupDictAnagram,
} from './anagram-lookup-table-services';
import { buildLookupDict, LookupDict } from './lookup-table-services';

interface TitlesDicts {
  lookupDict: LookupDict;
  anagramDict: LookupDictAnagram;
}
const titlesPath: string =
  process.env.HE_WIKI_TITLES || './resources/hewiki-20180701-all-titles-in-ns0';
const loadTitlesFile = () => fs.readFileSync(titlesPath, 'utf8');

const writeTitlesMapFile = (dicts: TitlesDicts) =>
  fs.writeFileSync(
    './resources/hewiki-titles-dict-clean.json',
    JSON.stringify(dicts),
  );

/**
 * Script execution code starts here
 */
console.log('start time ' + Date.now());
console.log(
  'Preparing the dictionaries can take from few seconds up to ~30 minutes, depends on the device',
);
const data = loadTitlesFile();

// Build dicts - lookup dict for definitions based on completion of multiword expressions,
// anagrams dict is for definitions based on anagrams clues
const lookupDict = buildLookupDict(data);
const anagramDict = buildLookupDictAnagram(data);
const dicts = { lookupDict, anagramDict } as TitlesDicts;

writeTitlesMapFile(dicts);

console.log('finish time ' + Date.now());
