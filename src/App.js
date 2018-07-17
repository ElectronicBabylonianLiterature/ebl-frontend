import React, { Component, Fragment } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import './App.css'

import Header from './Header'
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
        <Header auth={this.props.auth} />
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
