import React from 'react'
import ReactGA from 'react-ga4'

import SessionContext from 'auth/SessionContext'
import ErrorBoundary from 'common/ErrorBoundary'

import { useAuthentication } from 'auth/Auth'
import Router from 'router/router'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import Services from 'router/Services'

if (process.env.REACT_APP_GA_TRACKING_ID) {
  ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID)
}

function App(services: Services): JSX.Element {
  const authenticationService = useAuthentication()
  // Session is retrieved from authenticationService
  // Auth state changes (login/logout) cause page reload via Auth0 redirect
  // so authenticationService is recreated with correct state
  return (
    <SessionContext.Provider value={authenticationService.getSession()}>
      <DictionaryContext.Provider value={services.wordService}>
        <ErrorBoundary>
          <Router {...services} />
        </ErrorBoundary>
      </DictionaryContext.Provider>
    </SessionContext.Provider>
  )
}

export default App
