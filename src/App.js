import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
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
          <h1 className='App-title'>
            <img src={logo} className='App-logo' alt='Electronic Babylonian Literature (eBL)' title='Electronic Babylonian Literature' />
          </h1>
          <nav className='App-nav'>
            <ul>
              <li><Link to='/'>Home</Link></li>
              <li><Link to='/dictionary'>Dictionary</Link></li>
              <li><User auth={this.props.auth} /></li>
            </ul>
          </nav>
        </header>
        <Route exact path='/' render={props => (
          <section className='App-intro'>
            <h2>Welcome</h2>
          </section>
        )} />
        <Route path='/dictionary' render={props => <Dictionary auth={this.props.auth} />} />
        <Route path='/callback' render={props => <Callback {...Object.assign({auth: this.props.auth}, props)} />} />
      </div>
    )
  }
}

export default App
