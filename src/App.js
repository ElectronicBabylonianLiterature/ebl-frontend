import React, { Fragment } from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.css'

import Header from './Header'
import Callback from './auth0/Callback'
import Introduction from 'Introduction'
import Dictionary from 'dictionary/search/Dictionary'
import WordEditor from 'dictionary/editor/WordEditor'
import FragmentView from 'fragmentarium//transliterate/FragmentView'
import Fragmentarium from 'fragmentarium/Fragmentarium'
import ErrorBoundary from 'ErrorBoundary'

function App ({ auth, wordRepository, fragmentRepository, imageRepository }) {
  return (
    <Fragment>
      <Header auth={auth} />
      <ErrorBoundary>
        <Switch>
          <Route path='/dictionary/:id' render={props => <WordEditor auth={auth} wordRepository={wordRepository} {...props} />} />
          <Route path='/dictionary' render={props => <Dictionary auth={auth} wordRepository={wordRepository} {...props} />} />
          <Route path='/fragmentarium/:id' render={props => <FragmentView auth={auth} imageRepository={imageRepository} fragmentRepository={fragmentRepository} {...props} />} />
          <Route path='/fragmentarium' render={props => <Fragmentarium auth={auth} fragmentRepository={fragmentRepository} {...props} />} />
          <Route path='/callback' render={props => <Callback auth={auth} {...props} />} />
          <Route component={Introduction} />
        </Switch>
      </ErrorBoundary>
    </Fragment>
  )
}

export default App
