import React, { useState, useEffect } from 'react';
import { Router, Switch, Route } from "react-router-dom";
import Home from "./Home";
import { createBrowserHistory } from "history";
import logo from './logo.svg';
import './App.css';

const hist = createBrowserHistory();

function App() {

  return (
    <>
      <Router history={hist}>
          <Switch>
            <Route path="/" render={() => (<Home />)} />
          </Switch>
      </Router>
    </>
  );
}

export default App;
