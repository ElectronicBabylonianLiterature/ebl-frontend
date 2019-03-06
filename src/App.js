import React from 'react'
import { Route, Switch } from 'react-router-dom'

import Header from './Header'
import Callback from './auth/Callback'
import SessionContext from './auth/SessionContext'
import Introduction from 'Introduction'
import Dictionary from 'dictionary/search/Dictionary'
import WordEditor from 'dictionary/editor/WordEditor'
import FragmentView from 'fragmentarium/view/FragmentView'
import Fragmentarium from 'fragmentarium/Fragmentarium'
import ErrorBoundary from 'common/ErrorBoundary'
import FragmentariumSearch from 'fragmentarium/search/FragmentariumSearch'
import BibliographyEditor from 'bibliography/BibliographyEditor'
import Bibliography from 'bibliography/Bibliography'
import Corpus from 'corpus/Corpus'

function App ({ auth, wordService, fragmentService, bibliographyService }) {
  return (
    <SessionContext.Provider value={auth.getSession()}>
      <Header auth={auth} />
      <ErrorBoundary>
        <Switch>
          <Route path='/bibliography/:id' render={props => <BibliographyEditor bibliographyService={bibliographyService} {...props} />} />
          <Route path='/bibliography_new' render={props => <BibliographyEditor bibliographyService={bibliographyService} {...props} create />} />
          <Route path='/bibliography' render={props => <Bibliography bibliographyService={bibliographyService} {...props} />} />
          <Route path='/dictionary/:id' render={props => <WordEditor wordService={wordService} {...props} />} />
          <Route path='/dictionary' render={props => <Dictionary wordService={wordService} {...props} />} />
          <Route path='/corpus' render={props => <Corpus fragmentService={fragmentService} {...props} />} />
          <Route path='/fragmentarium/search' render={props => <FragmentariumSearch fragmentService={fragmentService} {...props} />} />
          <Route path='/fragmentarium/:id' render={props => <FragmentView fragmentService={fragmentService} {...props} />} />
          <Route path='/fragmentarium' render={props => <Fragmentarium fragmentService={fragmentService} {...props} />} />
          <Route path='/callback' render={props => <Callback auth={auth} {...props} />} />
          <Route component={Introduction} />
        </Switch>
      </ErrorBoundary>
    </SessionContext.Provider>
  )
}

export default App
