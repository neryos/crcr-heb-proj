#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
    Training script - creates fastText or word2vec vectors, 
"""

import logging
import multiprocessing
import os.path
import sys

from gensim.models.word2vec import Word2Vec
from gensim.models.word2vec import LineSentence

from gensim.models import FastText


if __name__ == '__main__':
    program = os.path.basename(sys.argv[0])
    logger = logging.getLogger(program)

    logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s')
    logging.root.setLevel(level=logging.INFO)
    logger.info("running %s" % ' '.join(sys.argv))

    # wiki input is a "clean" text file without metadata of wikimedia and punctuation. See the cleaning script.
    if len(sys.argv) != 6:
       logger.info("parameters format is wrong - please use:")
       logger.info("python train_word2vec.py <wv-format> <wiki_text_he> <vector-size> <window> <wv_output_path>")
       raise SystemExit

    wiki_text_input = sys.argv[1]
    wv_format = sys.argv[2]
    vectors_size = int(sys.argv[3])
    window_size = int(sys.argv[4])
    output_path = sys.argv[5]
    
    # ft = fasttext with default parameters, w2v = gensim word2vec
    if wv_format == "ft":
        model = FastText(LineSentence(wiki_text_input, max_sentence_length=10000000), size=vectors_size, window=window_size, min_count=5, sample=0.0001, min_n=3, max_n=6, iter=5, workers=multiprocessing.cpu_count())
    elif wv_format == "w2v":
        model = Word2Vec(LineSentence(wiki_text_input, max_sentence_length=10000000), size=vectors_size, window=window_size, min_count=5, workers=multiprocessing.cpu_count())
    else:
        logger.info("Word vectors format it invalid, choose 'ft' for pretrained fastext or 'w2v' for traind word2vec")
        raise SystemExit
        
    # trim unneeded model memory = use (much) less RAM
    model.init_sims(replace=True)
    model.wv.save_word2vec_format(output_path)