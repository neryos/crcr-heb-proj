import Button from '@material-ui/core/Button';
import GetApp from '@material-ui/icons/GetApp';
import Publish from '@material-ui/icons/Publish';
import { saveAs } from 'file-saver';
import { EOL } from 'os';
import * as React from 'react';

import { parse } from '../solver/parser/clues-parser';
import { prepareForSolver } from '../solver/solver-services';
import { DataForCandidatesSuggester, Definition } from '../solver/types';

const linesSeparator = EOL;

const styles = {
  buttonLabel: {
    padding: '15px',
  } as React.CSSProperties,

  interactionButton: {
    margin: '15px',
  } as React.CSSProperties,

  input: {
    display: 'none',
  } as React.CSSProperties,
};

export class DefintionsLoader extends React.Component {

  getText = (e: Event) => {
    const file = e.target as FileReader;
    return file.result as string;
  };

  private handleFileDownload = (
    dataForSuggester: DataForCandidatesSuggester[],
  ) => {
    const content = JSON.stringify(dataForSuggester);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'suggester-data.json');
  };

  onLoadCandidates = (e: Event) => {
    const text = this.getText(e);
    const definitions = text
      .split(linesSeparator)
      .map(rawDefinition => parse(rawDefinition));
    const suggesterData = definitions
      .filter(definition => definition !== undefined)
      .map((definition: Definition) => {
        const dataForSuggester = prepareForSolver(definition);
        return dataForSuggester;
      });
    this.handleFileDownload(suggesterData);
  };

  handleFileUploadChange = (files: FileList) => {
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        if (file.name.endsWith('.txt')) {
          reader.onload = this.onLoadCandidates;
        }
        reader.readAsText(file);
      }
    }
  };

  getUploader = () => {
    return (
      <React.Fragment>
        {' '}
        <label style={styles.buttonLabel} htmlFor="upload-definitions">
          <Button
            variant="raised"
            component="span"
            style={styles.interactionButton}
          >
            Upload & Analyze Definitions File
            <Publish />
            <GetApp />
          </Button>
        </label>
        <input
          id="upload-definitions"
          type="file"
          multiple={false}
          style={styles.input}
          onChange={e => {
            if (e.target.files) {
              this.handleFileUploadChange(e.target.files);
              // tslint:disable-next-line:no-any
              (e.target as any).files = null;
            }
          }}
        />
      </React.Fragment>
    );
  };

  render = () => {
    return this.getUploader();
  };
}
