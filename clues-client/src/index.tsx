import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/app';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
registerServiceWorker();
