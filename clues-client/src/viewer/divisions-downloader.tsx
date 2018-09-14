import Button from '@material-ui/core/Button';
import GetApp from '@material-ui/icons/GetApp';
import { saveAs } from 'file-saver';
import * as React from 'react';

import { parse } from '../solver/parser/clues-parser';
import { prepareForSolver } from '../solver/solver-services';
import { DataForCandidatesSuggester } from '../solver/types';

interface DivisionsDownloaderProps {
  rawDefinition: string;
}

interface DivisionsDownloaderState {}

const styles = {
  solveButton: {
    margin: '30px',
  } as React.CSSProperties,
};

export class DivisionsDownloader extends React.Component<
  DivisionsDownloaderProps,
  DivisionsDownloaderState
> {
  private handleFileDownload = (
    dataForSuggester: DataForCandidatesSuggester[],
  ) => {
    const content = JSON.stringify(dataForSuggester);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'divisions-data.json');
  };

  // tslint:disable-next-line:no-any
  onSolve = (e: any) => {
    // Handle only valid clues!
    if (this.props.rawDefinition) {
      const definition = parse(this.props.rawDefinition);
      if (definition) {
        const dataForSuggester = prepareForSolver(definition);
        if (dataForSuggester) {
          this.handleFileDownload([dataForSuggester]);
        }
      } 
    }
  };

  getDownloader = () => {
    return (
      <Button
        variant="raised"
        component="span"
        style={styles.solveButton}
        onClick={this.onSolve}
      >
        Analyze
        <GetApp />
      </Button>
    );
  };

  render() {
    return this.getDownloader();
  }
}
