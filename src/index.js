import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import * as Promise from 'bluebird'
import './index.css'
import App from './App'
import ErrorBoundary from 'ErrorBoundary'
import registerServiceWorker from './registerServiceWorker'

import Auth from 'auth0/Auth'
import ApiClient from 'http/ApiClient'
import WordRepository from 'dictionary/WordRepository'
import FragmentRepository from 'fragmentarium/FragmentRepository'
import ImageRepository from 'fragmentarium/ImageRepository'
import FragmentService from 'fragmentarium/FragmentService'
import WordService from 'dictionary/WordService'

Promise.config({
  cancellation: true
})

const auth = new Auth()
const apiClient = new ApiClient(auth)
const wordRepository = new WordRepository(apiClient)
const fragmentRepository = new FragmentRepository(apiClient)
const imageRepository = new ImageRepository(apiClient)
const fragmentService = new FragmentService(auth, fragmentRepository, imageRepository)
const wordService = new WordService(auth, wordRepository)

ReactDOM.render(
  <ErrorBoundary>
    <Router>
      <App
        auth={auth}
        wordService={wordService}
        fragmentService={fragmentService}
      />
    </Router>
  </ErrorBoundary>,
  document.getElementById('root')
)
registerServiceWorker()
