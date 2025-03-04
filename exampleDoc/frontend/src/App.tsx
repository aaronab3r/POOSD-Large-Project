//import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage.tsx';
import CardPage from './pages/CardPage.tsx';

function App() 
{
	return (
		<Router >
			<Switch>
				<Route path="/" exact>
					<LoginPage />
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
