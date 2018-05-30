import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';

import 'element-theme-default';

import WordSearch from './WordSearch'
import Word from './Word'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Electronic Babylonian Literature</h1>
        </header>
        <p className="App-intro">
          Dictionary
        </p>
        <WordSearch></WordSearch>
        <Word value={{source: '**lemma**, *form* "meaning" \\[LOGOGRAM\\] **G** (*a*/*u*) \\> derived'}}></Word>
      </div>
    );
  }
}

export default App;
