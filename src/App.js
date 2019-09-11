import React from 'react'
import { Route, Switch } from 'react-router-dom'
import queryString from 'query-string'

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
import ChapterView from 'corpus/ChapterView'
import TextView from 'corpus/TextView'

function parseTextParams(params) {
  return {
    category: decodeURIComponent(params.category),
    index: decodeURIComponent(params.index)
  }
}

function parseChapterParams(params) {
  return {
    ...parseTextParams(params),
    stage: decodeURIComponent(params.stage),
    name: decodeURIComponent(params.chapter)
  }
}

function parseFragmentSearchParams(location) {
  return {
    number: queryString.parse(location.search).number,
    transliteration: queryString.parse(location.search).transliteration
  }
}

function App({
  auth,
  wordService,
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  textService
}) {
  return (
    <SessionContext.Provider value={auth.getSession()}>
      <Header auth={auth} />
      <ErrorBoundary>
        <Switch>
          <Route
            path="/bibliography/:id"
            render={props => (
              <BibliographyEditor
                bibliographyService={bibliographyService}
                {...props}
              />
            )}
          />
          <Route
            path="/bibliography_new"
            render={props => (
              <BibliographyEditor
                bibliographyService={bibliographyService}
                {...props}
                create
              />
            )}
          />
          <Route
            path="/bibliography"
            render={props => (
              <Bibliography
                bibliographyService={bibliographyService}
                {...props}
              />
            )}
          />
          <Route
            path="/dictionary/:id"
            render={props => (
              <WordEditor wordService={wordService} {...props} />
            )}
          />
          <Route
            path="/dictionary"
            render={props => (
              <Dictionary wordService={wordService} {...props} />
            )}
          />
          <Route
            path="/corpus/:category/:index/:stage/:chapter"
            render={({ match }) => (
              <ChapterView
                textService={textService}
                bibliographyService={bibliographyService}
                {...parseChapterParams(match.params)}
              />
            )}
          />
          <Route
            path="/corpus/:category/:index"
            render={({ match }) => (
              <TextView
                textService={textService}
                {...parseTextParams(match.params)}
              />
            )}
          />
          <Route
            path="/corpus"
            render={props => (
              <Corpus
                textService={textService}
                fragmentService={fragmentService}
                {...props}
              />
            )}
          />
          <Route
            path="/fragmentarium/search"
            render={({ location }) => (
              <FragmentariumSearch
                fragmentService={fragmentService}
                fragmentSearchService={fragmentSearchService}
                {...parseFragmentSearchParams(location)}
              />
            )}
          />
          <Route
            path="/fragmentarium/:id"
            render={props => (
              <FragmentView
                fragmentService={fragmentService}
                fragmentSearchService={fragmentSearchService}
                {...props}
              />
            )}
          />
          <Route
            path="/fragmentarium"
            render={({ location }) => (
              <Fragmentarium
                fragmentService={fragmentService}
                fragmentSearchService={fragmentSearchService}
                {...parseFragmentSearchParams(location)}
              />
            )}
          />
          <Route
            path="/callback"
            render={props => <Callback auth={auth} {...props} />}
          />
          <Route component={Introduction} />
        </Switch>
      </ErrorBoundary>
    </SessionContext.Provider>
  )
}

export default App
