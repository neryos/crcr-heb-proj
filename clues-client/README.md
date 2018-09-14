Setup of client app:
	Go to the app available on the cloud at, or run in locally.

Instructions for local running of js code: 
1. You will need to run node.js. Download yarn, npm. 
    1. https://yarnpkg.com/en/docs/install
    2. https://www.npmjs.com/get-npm
2. 

Using yarn will allow you to run the code very easily. 


Git
Clone from url
https://github.com/neryos/crcr-heb-proj.git

Go to clues-client folder.
	cd clues-client

Install js libraries using the command:
	yarn install 

Run the app
	yarn start

If compiled successfully, the app is now available at http://localhost:3000/

Word vectors:
1. Download pre-trained fastText text vectors for Hebrew from https://fasttext.cc/docs/en/crawl-vectors.html
	A file name cc.he.300.vec.gz should be downloaded. Using the binary file creates problems with Hebrew unicode, so unzip the file. Use “less” command to view the first vectors in the file. The first line contains the number of vector and dimensions. 

1. Training phase :
    1. Download the dump of he-wiki articles (All pages, current versions only) from https://dumps.wikimedia.org/hewiki/20180701/
    2. Clean the dump using the cleaning script (it can take several hours):
        1. Go to the folder scripts/training
        2. Run the clean-wiki-dump python script:  python clean-wiki-dump.py <wiki-he-xml.bz2> <output-path>
            * wiki-he-xml.bz2 - the xml.bz2 dump 
            * output-path - the path for the cleaned version
    3. Train the model:
        1. 



Titles dictionary:
1. There is a pre-trained clean titles dictionary located in the resources folder of the project. Unzip the file before using it.
2. To train a new dictionary:
    1. Download the dump of the titles list (List of page titles in main namespace) from https://dumps.wikimedia.org/hewiki/20180701/. 
    2. Install yarn+npm (see above).
    3. Declare env variable HE_WIKI_TITLES with the path to the titles dump file, or copy the file into scripts/training/titles-cleaner/resources/hewiki-all-titles-in-ns0
    4. Go to the folder: scripts/training/titles-cleaner/
    5. To install dependencies run: yarn install
    6. To run the script: yarn start
    7. The results will be saved into the file scripts/training/titles-cleaner/resources/hewiki-titles-dict-clean.json. You can stop the script with CTRL+C.

How to use the app :
1. Uploading clues: 
    1. Enter clue that matches and format and click analyze,  or upload given clues-file from the zipped data folder. 
    2. A file named  divisions-data.json containing the divisions should be downloaded to your device.

2.  Creating divisions using the decoder:
    1. From the home folder of the project go to scripts/decoder:  
		cd scripts/decoder

    1.  Run the python script with the parameters. This may take some time (from 1 minute to 30 minutes). Some warnings about OOV words will be printed.
		python candidates-suggester.py <wv-format> <word-vectors-file> <vectors-limit> <titles-dictionary-file> <divisions-file>
		* wv-format: ft or w2v. Choose ft for the pre-trained vectors.
		* word-vectors-file: path for the text vectors file. For example ../cc.he.300.vec
		* vectors-limit - limit the number of vectors from the file. A pre-trained fastest file contains 2000000 vectors. You can start with 10000 or 150000.
		* titles-dictionary-file: path for the cleaned titles dictionary json file. For example:  ../hewiki-titles-map-clean.json
		* divisions-file: path for the divisions json file created using the JS app.

    2. A candidates json file will be created in the decoder folder. Go to the JS app, and upload these results using the “UPDATE CANDIDATES FILE”. You can choose whether to use weights with anagrams candidates (default is true).
    3. Evaluation metrics for the clues will be displayed. You can download it as a json file. 
