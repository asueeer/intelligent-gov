import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Route } from 'react-router-dom';
import { setVisitorId } from './utils/fingerprint';
import './index.css';
import Search from './pages/search';
import Im from './pages/im';
import ImService  from './pages/im-service';

setVisitorId();

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Route path="/search" component={Search} />
      <Route path="/im/" component={Im} />
      <Route path="/im-service/" component={ImService} />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
