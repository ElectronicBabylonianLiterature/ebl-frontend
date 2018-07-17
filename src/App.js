import React, { Component, Fragment } from 'react'
import { Route, Link, Switch, Redirect } from 'react-router-dom'
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
      <Fragment>
        <header className='App-header'>
          <h1 className='App-header__title'>
            <img src={logo} className='App-header__logo' alt='Electronic Babylonian Literature (eBL)' title='Electronic Babylonian Literature' />
          </h1>
          <nav>
            <ul className='App-header__nav'>
              <li className='App-header__nav-item'><Link to='/'>Home</Link></li>
              <li className='App-header__nav-item'><Link to='/dictionary'>Dictionary</Link></li>
              <li className='App-header__nav-item'><Link to='/fragmentarium/K.1'>Fragmentarium</Link></li>
              <li className='App-header__nav-item'><User auth={this.props.auth} /></li>
            </ul>
          </nav>
        </header>
        <Switch>
          <Route path='/dictionary/:id' render={props => <WordEditor apiClient={apiClient} {...props} />} />
          <Route path='/dictionary' render={props => <Dictionary auth={this.props.auth} apiClient={apiClient} {...props} />} />
          <Route path='/fragmentarium/:id' render={props => <Fragmentarium auth={this.props.auth} apiClient={apiClient} {...props} />} />
          <Redirect from='/fragmentarium' to='/fragmentarium/K.1' />
          <Route path='/callback' render={props => <Callback auth={this.props.auth} {...props} />} />
          <Route component={Introduction} />
        </Switch>
      </Fragment>
    )
  }
}

export default App
