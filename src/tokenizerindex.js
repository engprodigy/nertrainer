import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './TokenizerApp.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import TokenizerApp from './TokenizerApp';

//ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<TokenizerApp />, document.getElementById('app'));
registerServiceWorker();
