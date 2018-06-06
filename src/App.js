import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import logo from './logo.png'
import './App.css'

import 'element-theme-default'

import User from './auth0/User'
import Callback from './auth0/Callback'
import Dictionary from './dictionary/Dictionary'

class App extends Component {
  render () {
    return (
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <h1 className='App-title'>Electronic Babylonian Literature</h1>
          <User auth={this.props.auth} />
        </header>
        <p className='App-intro'>
          Dictionary
        </p>
        <Route exact path='/' render={props => <Dictionary auth={this.props.auth} />} />
        <Route path='/callback' render={props => <Callback {...{...props, auth: this.props.auth}} />} />
      </div>
    )
  }
}

export default App
