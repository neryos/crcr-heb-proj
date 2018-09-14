import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import GetApp from '@material-ui/icons/GetApp';
import Publish from '@material-ui/icons/Publish';
import { saveAs } from 'file-saver';
import * as React from 'react';

import { evaluate } from '../solver/candidates/evaluation-services';
import { rank } from '../solver/candidates/ranking-services';
import {
  DefinitionEvaluation,
  DefinitionsCandidatesData,
  GlobalEvaluation,
} from '../solver/candidates/types';

import DefinitionsEvaluationDisplay from './definitions-evaluation-display';
import GlobalEvaluationDisplay from './global-evaluation-display';

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
  downLoadButton: {
    margin: '30px',
  } as React.CSSProperties,
};

interface CandidatesSectionState {
  definitionsEvaluation: DefinitionEvaluation[];
  globalEvaluation?: GlobalEvaluation;
  data?: DefinitionsCandidatesData[];
  isAnagramScoreRecalculated: boolean;
}

export class CandidatesSection extends React.Component<
  {},
  CandidatesSectionState
> {
  constructor(props: {}) {
    super(props);
    this.state = {
      definitionsEvaluation: [],
      isAnagramScoreRecalculated: true,
    };
  }

  getText = (e: Event) => {
    const file = e.target as FileReader;
    return file.result as string;
  };

  handleFileUploadChange = (files: FileList) => {
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        if (file.name.endsWith('.json')) {
          reader.onload = this.onLoadCandidates;
        }
        reader.readAsText(file);
      }
    }
  };

  loadEvaluation = (
    data: DefinitionsCandidatesData[],
    isAnagramScoreRecalculated: boolean,
  ) => {
    const definitionsEvaluation = rank(data, isAnagramScoreRecalculated);
    const globalEvaluation = evaluate(definitionsEvaluation);
    this.setState({
      definitionsEvaluation,
      globalEvaluation,
      data: data,
    });
  };

  onLoadCandidates = (e: Event) => {
    const text = this.getText(e);
    const data: DefinitionsCandidatesData[] = JSON.parse(text);
    this.loadEvaluation(data, this.state.isAnagramScoreRecalculated);
  };

  onEvaluationDownload = () => {
    if (this.state.definitionsEvaluation && this.state.globalEvaluation) {
      const evaluationResults = {
        definitionsEvaluation: this.state.definitionsEvaluation,
        globalEvaluation: this.state.globalEvaluation,
      };
      const data = JSON.stringify(evaluationResults);
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, 'crcr-eval.json');
    }
  };

  // tslint:disable-next-line:no-any
  handleAnagramChange = (name: string) => (event: any) => {
    this.setState({ [name]: event.target.checked } as CandidatesSectionState);
    if (this.state.data) {
      this.loadEvaluation(this.state.data, event.target.checked);
    }
  };

  getCandidatesUploader = () => {
    return (
      <React.Fragment>
        {' '}
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.isAnagramScoreRecalculated}
              onChange={this.handleAnagramChange('isAnagramScoreRecalculated')}
              value="isAnagramScoreRecalculated"
              color="primary"
            />
          }
          label="Weighted Anagrams Candidates"
        />
        <label style={styles.buttonLabel} htmlFor="upload-candidates">
          <Button
            variant="raised"
            component="span"
            style={styles.interactionButton}
          >
            Upload Candidates File
            <Publish />
          </Button>
        </label>
        <input
          id="upload-candidates"
          type="file"
          multiple={false}
          style={styles.input}
          onChange={e => {
            if (e.target.files) {
              this.handleFileUploadChange(e.target.files);
            }
          }}
        />
      </React.Fragment>
    );
  };

  getGlobalEvaluation = () => {
    if (this.state.globalEvaluation) {
      return (
        <GlobalEvaluationDisplay
          globalEvaluation={this.state.globalEvaluation}
        />
      );
    }
    return null;
  };

  getEvaluationPerDefinition = () => {
    if (
      this.state.definitionsEvaluation &&
      this.state.definitionsEvaluation.length > 0
    ) {
      return (
        <DefinitionsEvaluationDisplay
          definitionsEvaluation={this.state.definitionsEvaluation}
        />
      );
    }
    return null;
  };

  getEvaluationDownloader() {
    return (
      <Button
        variant="raised"
        component="span"
        style={styles.downLoadButton}
        onClick={this.onEvaluationDownload}
      >
        Download Evaluation Metrics
        <GetApp />
      </Button>
    );
  }

  render() {
    return (
      <div>
        {this.getCandidatesUploader()}
        {this.getEvaluationDownloader()}
        {this.getGlobalEvaluation()}
        {this.getEvaluationPerDefinition()}
      </div>
    );
  }
}
