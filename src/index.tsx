import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import * as serviceWorker from 'serviceWorker'

import ErrorReporterContext from 'ErrorReporterContext'
import SentryErrorReporter from 'common/errors/SentryErrorReporter'
import InjectedAuth0Provider from 'auth/InjectedAuth0Provider'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'index.sass'
import InjectedApp from 'InjectedApp'

if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV) {
  SentryErrorReporter.init(
    process.env.REACT_APP_SENTRY_DSN,
    process.env.NODE_ENV,
  )
}

const errorReporter = new SentryErrorReporter()

const container = document.getElementById('root')
if (!container) throw new Error('Failed to find the root element')
const root = createRoot(container)
root.render(
  <ErrorReporterContext.Provider value={errorReporter}>
    <ErrorBoundary>
      <Router>
        <div className="mh-100">
          <div>
            <InjectedAuth0Provider>
              <InjectedApp errorReporter={errorReporter} />
            </InjectedAuth0Provider>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  </ErrorReporterContext.Provider>,
)

serviceWorker.unregister()
