import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
import logo from './logo.png'
import './App.css'

import User from './auth0/User'
import Callback from './auth0/Callback'
import Introduction from './Introduction'
import Dictionary from './dictionary/search/Dictionary'
import WordEditor from './dictionary/editor/WordEditor'
import Fragmentarium from './fragmentarium/Fragmentarium'
import ApiClient from './http/ApiClient'

class App extends Component {
  render () {
    const apiClient = new ApiClient(this.props.auth)

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
        <Route exact path='/' component={Introduction} />
        <Route exact path='/dictionary' render={props => <Dictionary auth={this.props.auth} apiClient={apiClient} {...props} />} />
        <Route path='/dictionary/:id' render={props => <WordEditor apiClient={apiClient} {...props} />} />
        <Route path='/fragmentarium/:id' render={props => <Fragmentarium auth={this.props.auth} apiClient={apiClient} {...props} />} />
        <Route path='/callback' render={props => <Callback auth={this.props.auth} {...props} />} />
      </div>
    )
  }
}

export default App
