#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CRCR-CS (CRyptic CRossword clues Candidates Suggester)
    
 Note: I had zero knowledge in python prior to this project, so please be patient about python conventions.
 
 Background:
  Cryptic crossword clue is a word puzzle, in which most of the time
  there are two ways to reach the same answer.
  The clue sentence can be divided into two or more parts that represent the clues, 
  but finding the correct division is part of the puzzle.
  
 Input:
     1. Pre-trained word vectors file in text format (not binary)
     2. Format of word embedding - ft = fasttext, w2v = word2vec
     2. Dictionaries that are based on titles (articles names) in wikipedia, in json format.
     4. Clues (definitions) division data - a file that was created by the JS app in json format:
         definition info - such as the length of the words in the solution.
         A list of possible divisions of the words in the definition.
 Output:
     A file containing candidates for the answer (solution) of each clue, in json format.

 The script was checked for both py2.7 (terminal) and py3.6 (IPython console).
 In some terminals Hebrew charcters may be unreadable.
    
 First, the script loads the word vectors (this could take a long time) 
 and the title dictionaries to the memory.
 Than it looks for possible candidates for answers based on semantic relationship between words.
  
 After creating the lists of candidates, the script is ready for input of another divisions file, 
  without the need to load the word vectors and the titles files again.
  
 This documentation uses of a transliteration technique from Hebrew to English from the article:
      Sima’an et al, "Building a Tree-Bank of Modern Hebrew Text", 2001.

"""

from datetime import datetime

from gensim.models.keyedvectors import KeyedVectors

import logging
import json
import os.path
import codecs
from six.moves import input
import sys
import numpy


# similarities parameters
# Empirically, 100 gives reasonable results
TOP_N = 100  
# Deafult score of similarity for title OOV words   
DEFAULT_SIM = 1

# fix numpy-json bug
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj): # pylint: disable=E0202
        if isinstance(obj, numpy.floating):
            return float(obj)
        return json.JSONEncoder.default(self, obj)

""" General utils for similarity services """
# sort list of created candidates (word, rank) based on their rank, in
# descending order - the top candidate is in the first element.
def sort(candidates):
    # cand[1] is the similarity score of the candidate
    sorted_cands = sorted(candidates, key=lambda cand: float(cand[1]), reverse=True)
    return sorted_cands

""" 
    Similarity services - multiword expressions
    One class of clues in cryptic crossowrds definitions is based on completion of multiword expression, phrases, etc. 
    Example: Given the definition: zrikt mtbe (3) = זריקת מטבע = in english: coin tossing, 
        The solution (which contains 3 letters word) is: xvc = חוץ, and in this context it has several meanings in english:
        The word "xvc" can be use to create a multiword expression with the first word: "zrikt xvc" = offside throw.
        The word "xvc" can be use to create a multiword expression with the second word: "mtbe xvc" = foreign currency.
    
    Sometimes such defintions contain more than 2 words, so the solution is connected to each of the words,
     sometimes some of the words are just conjuctions that help to make the definition more readable,
     and there are other cases, which won't be discussed here.

"""
def isNumberOfCandidatesInsufficient(candidatesNumber):
    return not candidatesNumber or len(candidatesNumber) < 10

# filter candidates that don't fit to the length of the words in the answer
def optimizeWords(most_sim_words, words_length):
    optimize_most_sim_words = []
    for sim_word in most_sim_words:
        if len(sim_word[0]) == words_length:
            optimize_most_sim_words.append(sim_word)
    return optimize_most_sim_words

# Most similar and nearest neighours queries.
# word_vectors.most_similar returns the values in descending order
def calcTop10MostSimilarWords(word_vectors, words, search_word_length):
    # equivalnce to: word_vectors.similar_by_word(word, topn=TOP_N)
    most_sim_words = word_vectors.most_similar(positive=words,topn=TOP_N)
    optimize_words = optimizeWords(most_sim_words, search_word_length)
    
    # If insufficient number of candidates was found, re-calc similiar words in a larger space
    if isNumberOfCandidatesInsufficient(optimize_words):
        most_sim_words = word_vectors.most_similar(positive=words,topn=TOP_N*4)
        optimize_words = optimizeWords(most_sim_words, search_word_length)
    
    return optimize_words
    
# Compute top-n most similar queries with 3Cosmul (Levy and Goldberg, Linguistic Regularities in Sparse and Explicit Word Representations, 2014)
# word_vectors.most_similar_cosmul returns the values in descending order
def calcTop10MostSimilarCosmulWords(word_vectors, words, search_word_length):
    most_sim_words = word_vectors.most_similar_cosmul(positive=words,topn=TOP_N)
    optimize_words = optimizeWords(most_sim_words, search_word_length)
    
    # If insufficient number of candidates was found, re-calc similiar words in a larger space
    if isNumberOfCandidatesInsufficient(optimize_words):
        most_sim_words = word_vectors.most_similar_cosmul(positive=words,topn=TOP_N*4)
        optimize_words = optimizeWords(most_sim_words, search_word_length)
    
    return optimize_words

# Find to 10 similar neighbors for each word. 
# The results of this function are no longer used in the ranking algorithm (JS app), 
# since empirically it doesn't provide good results. 
def calcSingleWordMeasures(word_vectors, words, search_words_length, logger):
    singleWordMeasures = []
    for word in words:
        try:
            optimized_most_sim_words = calcTop10MostSimilarWords(word_vectors, [word], search_words_length)
            optimized_most_sim_cosmul_words = calcTop10MostSimilarCosmulWords(word_vectors, [word], search_words_length)
            singleWordMeasures.append({ 'word': word, 'mostSimWords': optimized_most_sim_words, 'mostSimCosmulWords': optimized_most_sim_cosmul_words})
        except KeyError:
            logger.warning("\"word " + word + " not in vocabulary\"")
    return singleWordMeasures

# Create candidates based on multiword expression divisions
def getMultiwordMeasures(divisions, words_length, wv_format, titles_data, word_vectors, logger):
    divisionsMeasures = []
    # currently, multword expression only yield candidates if solution contains one word
    first_word_length = int(words_length[0])
    for division in divisions:
        # measures of similiraties for each word in the division:
        divisionMeasures = { 'singleWordMeasures': [], 'mostSimWords': [],
                            'mostSimCosmulWords': [], 'wordEmbeddingTechnique': wv_format }
        try:                        
            """ First solving techinque using word embeddings """
            # for each word, calc similar neighbors
            divisionMeasures['singleWordMeasures'] = calcSingleWordMeasures(word_vectors, division, first_word_length, logger)

            if len(words_length) == 1:
                # combined similarity measures - similarity between division parts
                divisionMeasures['mostSimWords'] = calcTop10MostSimilarWords(word_vectors, division, first_word_length)
                divisionMeasures['mostSimCosmulWords'] = calcTop10MostSimilarCosmulWords(word_vectors, division, first_word_length)
        except KeyError as e:
            logger.warning(e)

        """ Second solving technique using both titles dict and word vectors """
        # lookupDict is based on multiword expressions
        if "lookupDict" in titles_data:
            if len(words_length) == 1:
                divisionMeasures['titlesMeasures'] = calcTitlesMeasures(titles_data["lookupDict"], word_vectors, division, first_word_length, logger)
        
        """ Collect the measures into the candidates collection """
        divisionsMeasures.append(divisionMeasures)
    
    return divisionsMeasures
    
""" 
 Similarities services - multiword expressions - titles technique
 This technique make uses of dictionaries which are based on titles (article names) list from wikipedia,
  and word vectors to score the created candidates.
"""
# Find shared words between title names (= multiword expressions) in the dictionary    
def findSharedWordsBetweenTitlesDicts(titles_dict, words):
    sharedMweDict = []
    if len(words) > 1:
        if words[0] in titles_dict and words[1] in titles_dict:
            sharedMweDict = set(titles_dict[words[0]]) & set(titles_dict[words[1]])
            for word in words[2:]:
                if word in titles_dict:
                    nextWordDict = titles_dict[word]
                    if nextWordDict:
                        sharedMweDict = set(sharedMweDict) & set(nextWordDict)
    return sharedMweDict
    
# Search for candidates based on titles dictionary
# Currently it searches only for words that share MWE with all of the words in the clue
def calcTitlesMeasures(titles_dict, word_vectors, words, search_words_length, logger):
    sharedMweDict = findSharedWordsBetweenTitlesDicts(titles_dict, words)
    
    # Score/scale the shared words in the dictionary using similiraty measures
    titlesMostSimWords = []
    titlesSharedWordsWithoutSim = []
    for shardMweWord in sharedMweDict:
        if len(shardMweWord) == search_words_length:
            try:
                cossim = word_vectors.n_similarity(words, [shardMweWord])
                # convertion of cossim to string is needed in order for the json.dump to work in python 2.7
                titlesMostSimWords.append((shardMweWord, cossim))
                
            # In some cases candidates words could be found in the shared titles dictionary, 
            # but simularity between them and words of the division can't be computed due to OOV words.
            except KeyError:
                titlesSharedWordsWithoutSim.append((shardMweWord, DEFAULT_SIM))

    titlesMeasures = { 'titlesMostSimWords': sort(titlesMostSimWords), 'titlesWithoutSim': sort(titlesSharedWordsWithoutSim) }
    return titlesMeasures

""" 
 Similarities services - anagrams
 One class of clues is based on anagrams in the defintion.
 Example: Given the definition: rmz ssr (3) = רמז ששר,
    One of the meanings to this definition is "a clue that sings".
    The solution is: zmr = זמר = singer. 
    The word "zmr" is an anagram of "rmz", and the the other part of the definition also hint that.
    
 Sometimes such defintions contains hints words that imply that an anagram is used in the solution:
    such as "confused", "strange", "messy", etc. There are other cases, which won't be discussed here.
"""
# Score the similarity between two sets of words in the clue - the anagram segemnt and the non-anagram segement.
def calcSimliraityBetweenWords(word_vectors, anagram_words, second_part_words, logger):
    if len(anagram_words) > 0 and len(second_part_words) > 0:
        # Ignore words which are not in the dicionary
        for word in anagram_words:
            if word not in word_vectors.vocab:
                raise KeyError
    
        cossim = word_vectors.n_similarity(second_part_words, anagram_words)
        if len(anagram_words) == 1:
            return (anagram_words[0], cossim)
        
        # Join the anagram words to one string separated with space
        unifiedCandidateWords = ' '.join(anagram_words)
        return (unifiedCandidateWords, cossim)

# The title string in the dictionary can be a shuffle of the words in the definition -
# e.g: "room blue" is a shuffle of "blue room", and in such case it should be filtered 
def isCandidateBasedOnDefintion(candidate_words, anagram_part_words, logger):
    # create a copy of the anagram words
    anagram_words_copy = anagram_part_words[:]

    title_words_list = candidate_words
    if len(title_words_list) == len(anagram_part_words):
        for title_word in title_words_list:
            if title_word in anagram_words_copy:
                anagram_words_copy.remove(title_word)
        if len(anagram_words_copy) == 0:
            # a shuffle was detected, candidate should be filter            
            return True
    return False

# Score "partial similarity" bewteen most of the words in the title name,
# and most of the words in the non-anagram segement of the clue.
def partialSimScore(word_vectors, title_words_string, non_anagram_part_words, logger):
    title_words_in_vocub = []
    non_anagram_in_vocub = []

    title_words = title_words_string.split()
    
    for word in title_words:
        if word in word_vectors.vocab:
            title_words_in_vocub.append(word)
            
    if len(title_words_in_vocub) > 0:
        for word in non_anagram_part_words:
            if word in word_vectors.vocab:
                non_anagram_in_vocub.append(word)

    if len(non_anagram_in_vocub) * 2 > len(non_anagram_part_words):
        cossim = word_vectors.n_similarity(non_anagram_in_vocub, title_words_in_vocub)
        return cossim
    
    # partial similarity score was not found, use default score of 1
    return DEFAULT_SIM            

# Get a list of words composing the non-anagram part of the clue.
def getListOfWordsComposingClue(non_anagram_part_words, anagram_part_words):
    if len(non_anagram_part_words) > 0:
        return non_anagram_part_words
    
    # A special case in which all the words in the clue compose both an anagram clue and a non-anagram clue
    return anagram_part_words

# Score the similarity of title name from the dictianry with the non-anagram segement of the clue.
def calcTitlesAnagramSimilarities(titles_dict, word_vectors, sortedAnagramLetters, non_anagram_part_words, anagram_part_words, words_length, logger):
    titlesMostSimWords = []
    titlesAnagramsWithoutSim = []
    
    if len(sortedAnagramLetters) > 0:

        # Ignore anagrams that contain words which are not in the dicionary
        if sortedAnagramLetters in titles_dict:
            anagramOfTitles = titles_dict[sortedAnagramLetters]
            if len(anagramOfTitles) > 0:
                for title_words_string in anagramOfTitles:
                    title_words = title_words_string.split()
                    if not isCandidateBasedOnDefintion(title_words, anagram_part_words, logger):
                        wordsComposingSimilaritySide = getListOfWordsComposingClue(non_anagram_part_words, anagram_part_words)
                            
                        try: 
                            anagram_words_length = [len (word) for word in title_words_string.split()]
                            if anagram_words_length == words_length:
                                cossim = word_vectors.n_similarity(wordsComposingSimilaritySide, title_words)
                                titlesMostSimWords.append((title_words_string, cossim))
                        except KeyError:
                            # Try to calculate partial similarity
                                simScore = partialSimScore(word_vectors, title_words_string, wordsComposingSimilaritySide, logger)
                                titlesAnagramsWithoutSim.append((title_words_string, simScore))

    titlesMeasures = { 'titlesMostSimWords': sort(titlesMostSimWords), 'titlesWithoutSim': titlesAnagramsWithoutSim }
    return titlesMeasures  

# Create candidates based on anagrams divisions
def getAnagramMeasures(definition, divisions, titles_data, word_vectors, logger):
    divisionsMeasures = []
    for division in divisions["anagramDivisions"]:
        divisionMeasures = { 'clueWords': [], 'mostSimMeasures': [], 'titlesMeasures': [] }
        
        if "firstPart" in division:
            if "secondPart" in division:
                # join the anagram separated parts and copy into the candidate, for convenience only
                divisionMeasures['clueWords'] = ' '.join(division['secondPart'])
                
            if "anagrams" in division:
                similarityMeasures = []
                
                for anagramWordsGroup in division["anagrams"]:
                    
                    # In some cases, the anagram is composed from all the words in the definition. This case will be ignore for now.
                    if len(anagramWordsGroup) > 0 and len(division["firstPart"]) > 0:
                        try:
                            if not isCandidateBasedOnDefintion(anagramWordsGroup, division['secondPart'], logger):
                                similarityMeasure = calcSimliraityBetweenWords(word_vectors, anagramWordsGroup, division["firstPart"], logger)
                                similarityMeasures.append(similarityMeasure) 
    
                        # The majority of the anagrams should throw OOV error.
                        except KeyError:
                            pass
                        
                divisionMeasures['mostSimMeasures'] = sort(divisionMeasures['mostSimMeasures'] + similarityMeasures)
            
            if "sortedAnagramLetters" in division and "secondPart" in division and "anagramDict" in titles_data:
                solutionWordsLength = [int(num) for num in definition["wordsLength"]]
                titlesSimilarityMeasure = calcTitlesAnagramSimilarities(titles_data["anagramDict"], word_vectors, 
                                                                        division['sortedAnagramLetters'],
                                                                        division["firstPart"], 
                                                                        division["secondPart"], 
                                                                        solutionWordsLength,  logger)
                divisionMeasures['titlesMeasures'] = titlesSimilarityMeasure
                
        # A case in which the entire definition is an anagram and also a non-anagram clue
        else:
            if "secondPart" in division:
                # join the anagram separated parts and copy into the candidate, for convenience only
                divisionMeasures['clueWords'] = ' '.join(division['secondPart'])
            if "sortedAnagramLetters" in division and "secondPart" in division and "anagramDict" in titles_data:
                titlesSimilarityMeasure = calcTitlesAnagramSimilarities(titles_data["anagramDict"], word_vectors, 
                                                                        division['sortedAnagramLetters'],
                                                                        [], 
                                                                        division["secondPart"], 
                                                                        solutionWordsLength,  logger)
        divisionsMeasures.append(divisionMeasures)
    return divisionsMeasures  
    
""" CANDIDATAES' SUGGESTER """
def main():
    
    """ logger """
    logger = logging.getLogger(os.path.basename(sys.argv[0]))
    logging.basicConfig(format='%(asctime)s: %(levelname)s: %(message)s')
    logging.root.setLevel(level=logging.INFO)
    logger.info("running %s" % ' '.join(sys.argv))

    if len(sys.argv) != 6:
        logger.info("parameters format is wrong:")
        logger.info("python candidates-suggester.py <wordvec-format> <wordvec-file> <vectors-limit> <titles-files> <definitions-divisions-files>")
        logger.info("possible wordvec formats are ft and w2v")
        logger.info("make sure that all parameters are given, and that file path does not contain Hebrew chars, otherwise problems could occurs.")

        raise SystemExit
    
    wv_format, wv_file, wv_limit, titles_file, divisions_file  = sys.argv[1:6]
        
    """ load word vectors """
    logger.info("loading word vectors file... ")

    # ft = fasttext, w2v = gensim word2vec
    if wv_format == "ft" or wv_format == 'w2v':
        # example_path ../fasttext/cc.he.300.vec 
        word_vectors = KeyedVectors.load_word2vec_format(wv_file, binary=False, limit=int(wv_limit))

    else:
        logger.info("Word vectors format it invalid, choose 'ft' for pretrained fastext or 'w2v' for traind word2vec")
        raise SystemExit
    
    logger.info("word vectors file was loaded")
    
    """ load titles dict json file """
    logger.info("loading titles dict file... ")
    with codecs.open(titles_file ,'r', 'utf-8-sig') as f:
        titles_data = json.load(f)
        
    logger.info("titles dict file was loaded")
    
    """ load divisions data """
    waiting_for_divisions_file = True
    while waiting_for_divisions_file == True:
        try:
            logger.info("loading suggester data file with divisions...")
            with codecs.open(divisions_file ,'r', 'utf-8-sig') as f:
                suggester_data = json.load(f)
            logger.info("suggester data file was loaded")
        
            logger.info("searching for candidates... may take some time")
            
            """                
            For each division in the input, the CRCR-CS is searching for words in Hebrew
             that have the strongest semantic relationship with each part of the division.
            """
            
            # Iterate on each definition and prepare candidates
            candidatesData = []
            for defintionSuggestedData in suggester_data:
                logger.info(defintionSuggestedData['definition']['verbalClue'])
                if "definition" in defintionSuggestedData and "wordsLength" in defintionSuggestedData["definition"]:
                    
                    divisionsMeasures = { 'multiwordDivisionsMeasures': [], 
                                         'regularDivisionsMeasures': [], 'anagramDivisionsMeasures': [] }
                
                    if "divisions" in defintionSuggestedData:
                        # Divsions contains several types that are based on differnet classes of clues

                        # Iterate and explore divisions related to multiword expression of each definition
                        if "multiwordDivisions" in defintionSuggestedData["divisions"]:
                            divisionsMeasures['multiwordDivisionsMeasures'] = getMultiwordMeasures(defintionSuggestedData["divisions"]["multiwordDivisions"], 
                                             defintionSuggestedData["definition"]["wordsLength"], wv_format, titles_data, word_vectors, logger)
                        
                        # Iterate and explore divisions related to anagrams of words in the definition
                        if "anagramDivisions" in defintionSuggestedData["divisions"]:
                            divisionsMeasures['anagramDivisionsMeasures'] = getAnagramMeasures(defintionSuggestedData["definition"], defintionSuggestedData["divisions"], titles_data, word_vectors, logger)
                            
                    candidateData = {'divisionsMeasures': divisionsMeasures, 'definition': defintionSuggestedData['definition']}
                    candidatesData.append(candidateData)
          
            """ Write candidates output """
            logger.info('writing candidates file...')
            currTime = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
            candidates_data_file = 'candidates-' + currTime + '.json'
            
            with codecs.open(candidates_data_file ,'w+', 'utf-8') as f:
                json.dump(candidatesData, f, ensure_ascii=False, cls=NumpyEncoder)
            logger.info('finished with current suggested data divsions')

        except IOError as e:
            logger.error(e)

        logger.info('enter path to another suggester data file, or stop / quit / exit')
        
        next_command = input()
        if (next_command == 'stop') or (next_command == 'quit') or (next_command == 'exit'):
            waiting_for_divisions_file = False
        else:
            divisions_file = next_command

if __name__ == '__main__':
    main()