import React, { Fragment } from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.css'

import Header from './Header'
import Callback from './auth/Callback'
import Introduction from 'Introduction'
import Dictionary from 'dictionary/search/Dictionary'
import WordEditor from 'dictionary/editor/WordEditor'
import FragmentView from 'fragmentarium/transliterate/FragmentView'
import Fragmentarium from 'fragmentarium/search/Fragmentarium'
import ErrorBoundary from 'ErrorBoundary'

function App ({ auth, wordService, fragmentService }) {
  return (
    <Fragment>
      <Header auth={auth} />
      <ErrorBoundary>
        <Switch>
          <Route path='/dictionary/:id' render={props => <WordEditor wordService={wordService} {...props} />} />
          <Route path='/dictionary' render={props => <Dictionary wordService={wordService} {...props} />} />
          <Route path='/fragmentarium/:id' render={props => <FragmentView fragmentService={fragmentService} {...props} />} />
          <Route path='/fragmentarium' render={props => <Fragmentarium fragmentService={fragmentService} {...props} />} />
          <Route path='/callback' render={props => <Callback auth={auth} {...props} />} />
          <Route component={Introduction} />
        </Switch>
      </ErrorBoundary>
    </Fragment>
  )
}

export default App
