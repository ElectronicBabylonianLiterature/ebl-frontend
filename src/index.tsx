import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { useHistory } from 'router/compat'
import Promise from 'bluebird'
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
import TextService from 'corpus/application/TextService'
import createAuth0Config from 'auth/createAuth0Config'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { Auth0Provider } from 'auth/react-auth0-spa'
import { scopeString, useAuthentication } from 'auth/Auth'
import SignService from 'signs/application/SignService'
import SignRepository from 'signs/infrastructure/SignRepository'
import AfoRegisterRepository from 'afo-register/infrastructure/AfoRegisterRepository'
import MarkupService, {
  CachedMarkupService,
} from 'markup/application/MarkupService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.sass'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ApiFindspotRepository } from 'fragmentarium/infrastructure/FindspotRepository'
import DossiersService from 'dossiers/application/DossiersService'
import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'

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

function InjectedApp(): JSX.Element {
  const authenticationService = useAuthentication()
  const apiClient = useMemo(
    () => new ApiClient(authenticationService, errorReporter),
    [authenticationService],
  )
  const wordRepository = useMemo(
    () => new WordRepository(apiClient),
    [apiClient],
  )
  const signsRepository = useMemo(
    () => new SignRepository(apiClient),
    [apiClient],
  )
  const fragmentRepository = useMemo(
    () => new FragmentRepository(apiClient),
    [apiClient],
  )
  const imageRepository = useMemo(
    () => new ApiImageRepository(apiClient),
    [apiClient],
  )
  const bibliographyRepository = useMemo(
    () => new BibliographyRepository(apiClient),
    [apiClient],
  )
  const afoRegisterRepository = useMemo(
    () => new AfoRegisterRepository(apiClient),
    [apiClient],
  )
  const findspotRepository = useMemo(
    () => new ApiFindspotRepository(apiClient),
    [apiClient],
  )
  const dossiersRepository = useMemo(
    () => new DossiersRepository(apiClient),
    [apiClient],
  )

  const bibliographyService = useMemo(
    () => new BibliographyService(bibliographyRepository),
    [bibliographyRepository],
  )
  const fragmentService = useMemo(
    () =>
      new FragmentService(
        fragmentRepository,
        imageRepository,
        wordRepository,
        bibliographyService,
      ),
    [fragmentRepository, imageRepository, wordRepository, bibliographyService],
  )
  const fragmentSearchService = useMemo(
    () => new FragmentSearchService(fragmentRepository),
    [fragmentRepository],
  )
  const wordService = useMemo(
    () => new WordService(wordRepository),
    [wordRepository],
  )
  const textService = useMemo(
    () =>
      new TextService(
        apiClient,
        fragmentService,
        wordService,
        bibliographyService,
      ),
    [apiClient, fragmentService, wordService, bibliographyService],
  )
  const signService = useMemo(
    () => new SignService(signsRepository),
    [signsRepository],
  )
  const markupService = useMemo(
    () => new MarkupService(apiClient, bibliographyService),
    [apiClient, bibliographyService],
  )
  const cachedMarkupService = useMemo(
    () => new CachedMarkupService(apiClient, bibliographyService),
    [apiClient, bibliographyService],
  )
  const afoRegisterService = useMemo(
    () => new AfoRegisterService(afoRegisterRepository),
    [afoRegisterRepository],
  )
  const dossiersService = useMemo(
    () => new DossiersService(dossiersRepository),
    [dossiersRepository],
  )
  const findspotService = useMemo(
    () => new FindspotService(findspotRepository),
    [findspotRepository],
  )
  useEffect(() => {
    fragmentService.fetchProvenances().catch((error) => {
      errorReporter.captureException(error)
    })
    textService.list().catch(() => {})
    fragmentService.fetchGenres().catch(() => {})
  }, [fragmentService, textService])
  return (
    <App
      wordService={wordService}
      signService={signService}
      fragmentService={fragmentService}
      fragmentSearchService={fragmentSearchService}
      bibliographyService={bibliographyService}
      textService={textService}
      markupService={markupService}
      cachedMarkupService={cachedMarkupService}
      afoRegisterService={afoRegisterService}
      dossiersService={dossiersService}
      findspotService={findspotService}
    />
  )
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
      <Router>
        <div className="mh-100">
          <div>
            <InjectedAuth0Provider>
              <InjectedApp />
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
