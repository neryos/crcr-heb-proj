import TextField from '@material-ui/core/TextField';
import * as React from 'react';

import { CandidatesSection } from './candidates-section';
import { DefintionsLoader } from './definitions-loader';
import { DivisionsDownloader } from './divisions-downloader';
import { Instructions } from './instructions';

interface TextDefinitionState {
  rawDefinition?: string;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
    marginLeft: '15px',
  } as React.CSSProperties,
  textField: {
    margin: '15px',
    direction: 'rtl',
    width: 400,
  } as React.CSSProperties,
  format: {
    marginTop: '30px',
    marginLeft: '30px',
  } as React.CSSProperties,
  orMessage: {
    margin: '30px',
  } as React.CSSProperties,
};

export class CrcrViewer extends React.Component<{}, TextDefinitionState> {
  state = {
    rawDefinition: '',
  };

  // tslint:disable-next-line:no-any
  handleChange = (rawDefinition: string) => (event: any) => {
    this.setState({
      [rawDefinition]: event.target.value,
    });
  };

  getDefinitionsInput = () => {
    return (
      <div>
        {' '}
        <form style={styles.container} noValidate={true} autoComplete="off">
          <TextField
            id="rawDefinition"
            label="Hebrew definition"
            style={styles.textField}
            value={this.state.rawDefinition}
            onChange={this.handleChange('rawDefinition')}
            margin="normal"
          />
          {this.getDivisionsDownloader()}
          <span style={styles.orMessage}>OR</span>
          <DefintionsLoader />
        </form>
      </div>
    );
  };

  getDivisionsDownloader = () => {
    return (
      <div>
        {' '}
        <DivisionsDownloader rawDefinition={this.state.rawDefinition} />
      </div>
    );
  };

  getCandidatesSection = () => {
    return (
      <div>
        <div style={styles.format}>
          2. Run the python candidates suggester script to analyze the created
          divisions data.
        </div>
        <div style={styles.format}>
          3. Upload the script results - candidates json file. Evaluation tables
          will be displayed and available for download. You can upload
          additional files if needed.
          <CandidatesSection />
        </div>
      </div>
    );
  };

  render() {
    return (
      <div>
        <Instructions />
        {this.getDefinitionsInput()}
        {this.getCandidatesSection()}
      </div>
    );
  }
}
