import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import * as Promise from 'bluebird'
import './index.css'
import App from './App'
import ErrorBoundary from 'ErrorBoundary'
import registerServiceWorker from './registerServiceWorker'

import Auth from './auth0/Auth'

Promise.config({
  cancellation: true
})

const auth = new Auth()

ReactDOM.render(
  <ErrorBoundary>
    <Router>
      <App auth={auth} />
    </Router>
  </ErrorBoundary>,
  document.getElementById('root')
)
registerServiceWorker()
