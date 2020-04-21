import React, { PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, useHistory } from 'react-router-dom'
import Promise from 'bluebird'
import './index.css'
import App from './App'
import ErrorBoundary from 'common/ErrorBoundary'
import * as serviceWorker from './serviceWorker'

import ApiClient from 'http/ApiClient'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import ApiImageRepository from 'fragmentarium/infrastructure/ImageRepository'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import ErrorReporterContext from './ErrorReporterContext'
import SentryErrorReporter from 'common/SentryErrorReporter'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/TextService'
import createAuth0Config from 'auth/createAuth0Config'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { scopeString, useAuthentication } from 'auth/Auth'

if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV) {
  SentryErrorReporter.init(
    process.env.REACT_APP_SENTRY_DSN,
    process.env.NODE_ENV
  )
}

Promise.config({
  cancellation: true,
})

const errorReporter = new SentryErrorReporter()

function InjectedApp(): JSX.Element {
  const authenticationService = useAuthentication()
  const apiClient = new ApiClient(authenticationService, errorReporter)
  const wordRepository = new WordRepository(apiClient)
  const fragmentRepository = new FragmentRepository(apiClient)
  const imageRepository = new ApiImageRepository(apiClient)
  const bibliographyRepository = new BibliographyRepository(apiClient)
  const bibliographyService = new BibliographyService(bibliographyRepository)
  const fragmentService = new FragmentService(
    fragmentRepository,
    imageRepository,
    wordRepository,
    bibliographyService
  )
  const fragmentSearchService = new FragmentSearchService(fragmentRepository)
  const wordService = new WordService(wordRepository)
  const textService = new TextService(apiClient)
  return (
    <App
      wordService={wordService}
      fragmentService={fragmentService}
      fragmentSearchService={fragmentSearchService}
      bibliographyService={bibliographyService}
      textService={textService}
    />
  )
}

function InjectedAuth0Provider({
  children,
}: PropsWithChildren<{}>): JSX.Element {
  const auth0Config = createAuth0Config()
  const history = useHistory()
  return (
    <Auth0Provider
      domain={auth0Config.domain ?? ''}
      client_id={auth0Config.clientID ?? ''}
      redirect_uri={auth0Config.redirectUri ?? window.location.origin}
      onRedirectCallback={(appState): void => {
        history.push(
          appState && appState.targetUrl
            ? appState.targetUrl
            : window.location.pathname
        )
      }}
      scope={scopeString}
      audience={auth0Config.audience}
      returnTo={auth0Config.returnTo}
    >
      {children}
    </Auth0Provider>
  )
}

ReactDOM.render(
  <ErrorReporterContext.Provider value={errorReporter}>
    <ErrorBoundary>
      <Router>
        <InjectedAuth0Provider>
          <InjectedApp />
        </InjectedAuth0Provider>
      </Router>
    </ErrorBoundary>
  </ErrorReporterContext.Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
