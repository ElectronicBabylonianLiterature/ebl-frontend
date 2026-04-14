import React, { PropsWithChildren, useCallback, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { useHistory } from 'router/compat'
import Promise from 'bluebird'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import * as serviceWorker from './serviceWorker'

import ErrorReporterContext from './ErrorReporterContext'
import SentryErrorReporter from 'common/errors/SentryErrorReporter'
import createAuth0Config from 'auth/createAuth0Config'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { scopeString } from 'auth/Auth'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.sass'
import InjectedApp from './InjectedApp'

if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV) {
  SentryErrorReporter.init(
    process.env.REACT_APP_SENTRY_DSN,
    process.env.NODE_ENV,
  )
}

Promise.config({
  cancellation: true,
})

const errorReporter = new SentryErrorReporter()

export type JsonApiClient = {
  fetchJson: <T = unknown>(url: string, authorize: boolean) => Promise<T>
  fetchBlob: (url: string, authorize: boolean) => Promise<Blob>
  postJson: <T = unknown>(
    url: string,
    body: Record<string, unknown>,
    authorize?: boolean,
  ) => Promise<T>
}

function InjectedAuth0Provider({
  children,
}: PropsWithChildren<unknown>): JSX.Element {
  const auth0Config = useMemo(() => createAuth0Config(), [])
  const history = useHistory()
  type AppState = { targetUrl?: string }
  const authorizationParams = useMemo(
    () => ({
      // eslint-disable-next-line camelcase
      redirect_uri: window.location.origin,
      scope: scopeString,
      audience: auth0Config.audience,
    }),
    [auth0Config.audience],
  )
  const onRedirectCallback = useCallback(
    (appState: unknown): void => {
      const targetUrl = (appState as AppState | undefined)?.targetUrl
      history.push(targetUrl ? targetUrl : window.location.pathname)
    },
    [history],
  )
  return (
    <Auth0Provider
      domain={auth0Config.domain ?? ''}
      clientId={auth0Config.clientID ?? ''}
      authorizationParams={authorizationParams}
      onRedirectCallback={onRedirectCallback}
      returnTo={window.location.origin}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      useCookiesForTransactions={true}
    >
      {children}
    </Auth0Provider>
  )
}

const container = document.getElementById('root')
if (!container) throw new Error('Failed to find the root element')
const root = createRoot(container)
root.render(
  <ErrorReporterContext.Provider value={errorReporter}>
    <ErrorBoundary>
      {/* eslint-disable-next-line camelcase */}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
