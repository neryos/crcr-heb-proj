import * as React from 'react';

const styles = {
  example: {
    marginLeft: '30px',
  } as React.CSSProperties,
  defFormat: {
    marginLeft: '10px',
  } as React.CSSProperties,
  format: {
    marginTop: '30px',
    marginLeft: '30px',
  } as React.CSSProperties,
  nextMessage: {
    marginLeft: '40px',
  } as React.CSSProperties,
};

export class Instructions extends React.Component {
  getInitialInstructions = () => {
    return (
      <div>
        <div style={styles.format}>
          1. Enter an hebrew cryptic crossword definition and analyze it, or
          upload definitions txt file and analyze it. Note: Uploading a file
          with the same name multiple times in a row doesn't work due to browser
          mechanisms, so refresh the page if necessary.
        </div>
        <div style={styles.nextMessage}>
          The data will be downloaded to your device as a json file. You can
          skip to step 3 if you already have the CRCR python script results
        </div>
        <div style={styles.format}>
          <div>
            Format of defintion is strict:{' '}
            <i>v (ling) (len1, len2, ...) (c) - a</i>
          </div>
          <div style={styles.defFormat}>v = verbal clue</div>
          <div style={styles.defFormat}>ling = lingustic clue, if exist</div>
          <div style={styles.defFormat}>
            len1, len2, ... = length of each word in the answer
          </div>
          <div style={styles.defFormat}>c = compiler</div>
          <div style={styles.defFormat}>a = answer</div>
        </div>
        <div style={styles.format}>
          For example (you can copy one of this clues, they don't contain
          lingustic clues):
        </div>
        <div style={styles.example}>מגן שמש (3) (יוסי קאופמן) - דוד</div>
        <div style={styles.example}>מחזה ותו לא (5) (נריוס) - אותלו</div>
      </div>
    );
  };

  render() {
    return this.getInitialInstructions();
  }
}
