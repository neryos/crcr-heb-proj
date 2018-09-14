import * as React from 'react';

import { CrcrViewer } from '../viewer/crcr-viewer';

import './app.css';

class App extends React.Component {
  public render() {
    return (
      <div>
        {' '}
        <CrcrViewer />
      </div>
    );
  }
}

export default App;
