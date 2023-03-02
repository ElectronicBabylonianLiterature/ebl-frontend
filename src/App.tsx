import React from 'react'
import ReactGA from 'react-ga4'

import Header from './Header'
import SessionContext from 'auth/SessionContext'
import ErrorBoundary from 'common/ErrorBoundary'

import { useAuthentication } from 'auth/Auth'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import MarkupService from 'markup/application/MarkupService'
import SignService from 'signs/application/SignService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import Router from 'routes'

if (process.env.REACT_APP_GA_TRACKING_ID) {
  ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID)
}

function App({
  wordService,
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  textService,
  signService,
  markupService,
}: {
  wordService: WordService
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  bibliographyService: BibliographyService
  textService: TextService
  signService: SignService
  markupService: MarkupService
}): JSX.Element {
  const authenticationService = useAuthentication()
  return (
    <SessionContext.Provider value={authenticationService.getSession()}>
      <DictionaryContext.Provider value={wordService}>
        <Header />
        <ErrorBoundary>
          <Router
            wordService={wordService}
            fragmentService={fragmentService}
            fragmentSearchService={fragmentSearchService}
            bibliographyService={bibliographyService}
            textService={textService}
            signService={signService}
            markupService={markupService}
          />
        </ErrorBoundary>
      </DictionaryContext.Provider>
    </SessionContext.Provider>
  )
}

export default App
