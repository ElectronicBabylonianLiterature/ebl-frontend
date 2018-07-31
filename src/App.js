import React, { Component, Fragment } from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.css'

import Header from './Header'
import Callback from './auth0/Callback'
import Introduction from 'Introduction'
import Dictionary from 'dictionary/search/Dictionary'
import WordEditor from 'dictionary/editor/WordEditor'
import FragmentView from 'fragmentarium//transliterate/FragmentView'
import Fragmentarium from 'fragmentarium/Fragmentarium'
import ApiClient from 'http/ApiClient'
import ErrorBoundary from 'ErrorBoundary'

class App extends Component {
  render () {
    const apiClient = new ApiClient(this.props.auth)

    return (
      <Fragment>
        <Header auth={this.props.auth} />
        <ErrorBoundary>
          <Switch>
            <Route path='/dictionary/:id' render={props => <WordEditor auth={this.props.auth} apiClient={apiClient} {...props} />} />
            <Route path='/dictionary' render={props => <Dictionary auth={this.props.auth} apiClient={apiClient} {...props} />} />
            <Route path='/fragmentarium/:id' render={props => <FragmentView auth={this.props.auth} apiClient={apiClient} {...props} />} />
            <Route path='/fragmentarium' render={props => <Fragmentarium auth={this.props.auth} apiClient={apiClient} {...props} />} />
            <Route path='/callback' render={props => <Callback auth={this.props.auth} {...props} />} />
            <Route component={Introduction} />
          </Switch>
        </ErrorBoundary>
      </Fragment>
    )
  }
}

export default App
