import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import * as Promise from 'bluebird'
import './index.css'
import App from './App'
import ErrorBoundary from 'common/ErrorBoundary'
import * as serviceWorker from './serviceWorker'

import SessionStore from 'auth/SessionStore'
import Auth from 'auth/Auth'
import ApiClient from 'http/ApiClient'
import WordRepository from 'dictionary/WordRepository'
import FragmentRepository from 'fragmentarium/FragmentRepository'
import ImageRepository from 'fragmentarium/ImageRepository'
import BibliographyRepository from 'bibliography/BibliographyRepository'
import FragmentService from 'fragmentarium/FragmentService'
import WordService from 'dictionary/WordService'
import ErrorReporterContext from './ErrorReporterContext'
import SentryErrorReporter from 'common/SentryErrorReporter'
import BibliographyService from 'bibliography/BibliographyService'

SentryErrorReporter.init()

Promise.config({
  cancellation: true
})

const errorReporter = new SentryErrorReporter()
const auth = new Auth(new SessionStore(), errorReporter)
const apiClient = new ApiClient(auth)
const wordRepository = new WordRepository(apiClient)
const fragmentRepository = new FragmentRepository(apiClient)
const imageRepository = new ImageRepository(apiClient)
const bibliographyRepository = new BibliographyRepository(apiClient)
const bibliographyService = new BibliographyService(bibliographyRepository)
const fragmentService = new FragmentService(
  auth,
  fragmentRepository,
  imageRepository,
  wordRepository,
  bibliographyService
)
const wordService = new WordService(wordRepository)

ReactDOM.render(
  <ErrorReporterContext.Provider value={errorReporter}>
    <ErrorBoundary>
      <Router>
        <App
          auth={auth}
          wordService={wordService}
          fragmentService={fragmentService}
          bibliographyService={bibliographyService}
        />
      </Router>
    </ErrorBoundary>
  </ErrorReporterContext.Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister({})
