#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
This code is based on https://github.com/panyang/Wikipedia_Word2vec by Pan Yang, 2017 - MIT license
I changed it so the encoding wiil work, and I checked it for both py2.7 (terminal) and py3.6 (IPython console).
Performances can vary based on the compilers installed on the machine, etc.
"""

from __future__ import print_function

import logging
import os.path
import six
import sys

from gensim.corpora import WikiCorpus

if __name__ == '__main__':
    program = os.path.basename(sys.argv[0])
    
    # Define legger 
    logger = logging.getLogger(program)
    logging.basicConfig(format='%(asctime)s: %(levelname)s: %(message)s')
    logging.root.setLevel(level=logging.INFO)
    logger.info("running %s" % ' '.join(sys.argv))

    # Parameters for the script
    if len(sys.argv) != 3:
        print("The script receives 2 parameters: input - xml.bz2 dump file, and output path. Cleaning can take several hours.")
        print("Use: python clean_wiki.py xx-wiki.xxx.xml.bz2 wiki.xx.text")
        sys.exit(1)
        
    # input_dump = '../wiki-he/hewiki-20180701-pages-meta-current.xml.bz2'
    # output_text = '../wiki-he/wiki.he.text'
    input_dump, output_text = sys.argv[1:3]

    output = open(output_text, 'w')
    
    # Extract wiki page content from the xml-dump file using gensim and clean it from wikimedia meta-chars, without lemmatization
    wiki = WikiCorpus(input_dump, lemmatize=False, dictionary={})
    
    # Write the cleaned articles into one large file - one article per line, words are separated with space
    # text - array of words in each article
    chunk = 0

    for text in wiki.get_texts():
        if six.PY3:
            article = ' '.join(text)
            output.write(article + "\n")
        else:
            article = ' '.join(text).encode('utf-8')
            output.write(article + "\n")
            
        chunk = chunk + 1
        if (chunk % 10000 == 0):
            logger.info("Saved " + str(chunk) + " articles")

    output.close()
    logger.info("Finished - Saved " + str(chunk) + " articles")