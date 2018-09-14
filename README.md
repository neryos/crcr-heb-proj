# crcr-heb-proj

An app that tackled two simple types of cryptic crossword clues in Hebrew (anagrams, completion of MWE).
 
The project contains several components:
1. Trainer made of python scripts and JS server side script (titles-cleaner).
2. Decoder made of JS app (clues-client) and python scripts.

# Preparations of environment
1. In order to run python scripts, you need to install python 2.7 or python 3 environment.

2. In order to run JS server side script, you need node.js. Install the following tools:
    1. yarn: https://yarnpkg.com/en/docs/install
    2. npm: https://www.npmjs.com/get-npm

3. Clone the Git project to your device from https://github.com/neryos/crcr-heb-proj

# Training scripts
## Titles
1. Using pre-trained data: There is a pre-trained cleaned titles dictionary located in the pre-trained-data folder of the project. This is based on https://dumps.wikimedia.org/hewiki/20180701 version. Unzip the file before using it.
2. Train new dictionary:
    1. Download titles list dump (List of page titles in main namespace) from https://dumps.wikimedia.org/hewiki/. 
    2. Make sure you installed yarn (see above).
    3. Declare env variable HE_WIKI_TITLES with the path to the titles dump file, or locate the file into the default path in the project: scripts/training/titles-cleaner/resources/hewiki-all-titles-in-ns0
    4. Change directory to: scripts/training/titles-cleaner/
    5. To install dependencies run:
        yarn install
    6. To create dictionary:
        yarn start
    7. The results will be saved into the file scripts/training/titles-cleaner/resources/hewiki-titles-dict-clean.json.
    8. After the scripts finished, you can stop it using CTRL+C.

## Word vectors
1. Pre-trained vectors: 
    1. download pre-trained fastText vectors for Hebrew (text file) from https://fasttext.cc/docs/en/crawl-vectors.html. A file name cc.he.300.vec.gz should be downloaded. 
    2. Using the binary file creates problems with Hebrew unicode, so unzip the file.
    3. You can view the file. The first line contains the number of vectors and dimensions, each other line contains word vector, sorted in descending order of word frequencies.

1. Obtaining new word vectors:
    1. Download dump of he-wiki articles (All pages, current versions only) from https://dumps.wikimedia.org/hewiki/. I downloaded https://dumps.wikimedia.org/hewiki/20180701/ version.
    2. Clean the dump using the cleaning script (it can take several hours):
        1. Change directory to scripts/training
        2. Run the clean-wiki-dump python script with 2 parameters: 
            * python clean-wiki-dump.py <wiki-he-xml.bz2> <output-path>
            * wiki-he-xml.bz2 (str) - the wiki.xml.bz2 dump 
            * output-path (str)- path for the cleaned wiki version.
    3. Train the model:
        1. Change directory to scripts/training
        2. Run the train_wv python script with the following 5 parameters (there are no default values):
            * python train_word2vec.py <wv-format> <wiki-text-he> <vector-size> <window-size> <wv-output-path>
            * wv-format (str): trained model, choose ft or w2v
            * wiki-text-he (str): path for a clean wiki
            * vector-size (int): size of vector in the model. I used values between 100 to 300.
            * window-size (int): size of a window in the model. I used values between 1 to 5.
            * wv-output-path (str): path for the word vectors file.

# Decoder
## setup
1. You can use the client app on the cloud, or run it locally.
    1. Cloud client-side version: https://crcrhebproj.now.sh
    2. Setup of client app:
        1. From the home directory of the project, go to clues-client
        2. Install dependencies using the command
            yarn install 
        3. Run the app:
            yarn start
        4. If compiled successfully, the app is now available at your device, http://localhost:3000/

## Tackling clues
1. Uploading clues: 
    1. Enter clue that matches the clues format and click analyze, or upload a given clues-file.txt from the zipped data-and-result folder (this is not part of the Git project). 
    2. A file named divisions-data.json containing the divisions should be downloaded to your device.
2.  Creating candidates based on the divisions (may take some time, between 1 minute to 1 hour, depends on the device and the model):
    1. From the home folder of the project go to scripts/decoder  
    2. Run the python candidates-suggester script with the follwing 5 parameters. Some warnings about OOV words will be printed, and that's fine:
        * python candidates-suggester.py <wv-format> <word-vectors-file> <vectors-limit> <titles-dictionary-file> <divisions-file>
        * wv-format (str): ft or w2v. Choose ft for the pre-trained vectors.
        * word-vectors-file (str): path for the vectors text file. e.g" ../cc.he.300.vec
        * vectors-limit (int): the number of vectors to load. A pre-trained fastest file contains 2000000 vectors. Best results are with 150000.
        * titles-dictionary-file (str): path for the cleaned titles dictionary json file. e.g:  ../hewiki-titles-map-clean.json
        * divisions-file (str): path for the divisions json file that was created using the JS clues-client app.

    3. A candidates.json file will be created in the decoder folder, containing the time of the decoding (examples of results are in the data-and-results folder).
3. Go to the clues-client JS app, and upload the candidates results. You can choose whether to use "Weighted Anagrams Candidates" (default is true, sometimes yields a slighlty better results.
4. Evaluation metrics for the clues will be displayed in the JS app. You can download them as a json file.