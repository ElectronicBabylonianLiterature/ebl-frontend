import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import Promise from 'bluebird'
import './index.css'
import App from './App'
import ErrorBoundary from 'common/ErrorBoundary'
import * as serviceWorker from './serviceWorker'

import SessionStore from 'auth/SessionStore'
import Auth from 'auth/Auth'
import ApiClient from 'http/ApiClient'
import WordRepository from 'dictionary/WordRepository'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import ApiImageRepository from 'fragmentarium/infrastructure/ImageRepository'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/WordService'
import ErrorReporterContext from './ErrorReporterContext'
import SentryErrorReporter from 'common/SentryErrorReporter'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/TextService'
import createAuth0Config from 'auth/createAuth0Config'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV) {
  SentryErrorReporter.init(
    process.env.REACT_APP_SENTRY_DSN,
    process.env.NODE_ENV
  )
}

Promise.config({
  cancellation: true
})

const auth0Config = createAuth0Config()

const errorReporter = new SentryErrorReporter()
const auth = new Auth(new SessionStore(), errorReporter, auth0Config)
const apiClient = new ApiClient(auth, errorReporter)
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

ReactDOM.render(
  <ErrorReporterContext.Provider value={errorReporter}>
    <ErrorBoundary>
      <Router>
        <App
          auth={auth}
          wordService={wordService}
          fragmentService={fragmentService}
          fragmentSearchService={fragmentSearchService}
          bibliographyService={bibliographyService}
          textService={textService}
        />
      </Router>
    </ErrorBoundary>
  </ErrorReporterContext.Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
