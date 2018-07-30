import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App'
import ErrorBoundary from 'ErrorBoundary'
import registerServiceWorker from './registerServiceWorker'

import Auth from './auth0/Auth'

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
