//import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';
//import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import AppPage from './pages/App';

function App() {
  return (
  <Router >
    <Switch>
      <Route path="/" exact>
        <AppPage />
      </Route>
      <Route path="/cards" exact>
        <CardPage />
      </Route>
      <Redirect to="/" />
    </Switch>
  </Router>
  );
}

export default App;