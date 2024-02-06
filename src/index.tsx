import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, useHistory } from 'react-router-dom'
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
import KingsRepository from 'chronology/infrastructure/KingsRepository'
import MarkupService, {
  CachedMarkupService,
} from 'markup/application/MarkupService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import KingsService from 'chronology/application/KingsService'
import './index.sass'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ApiFindspotRepository } from 'fragmentarium/infrastructure/FindspotRepository'

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

export type JsonApiClient = {
  fetchJson: (url: string, authorize: boolean) => Promise<any>
  postJson: (
    url: string,
    body: Record<string, unknown>,
    authorize?: boolean
  ) => Promise<any>
}

function InjectedApp(): JSX.Element {
  const authenticationService = useAuthentication()
  const apiClient = useMemo(
    () => new ApiClient(authenticationService, errorReporter),
    [authenticationService]
  )
  const [kingsService, setKingsService] = useState<KingsService | null>(null)
  const [services, setServices] = useState<{
    fragmentService?: FragmentService
    wordService?: WordService
    signService?: SignService
    bibliographyService?: BibliographyService
    textService?: TextService
    markupService?: MarkupService
    cachedMarkupService?: CachedMarkupService
    afoRegisterService?: AfoRegisterService
    findspotService?: FindspotService
    fragmentSearchService?: FragmentSearchService
  }>({})

  useEffect(() => {
    async function initializeKingService() {
      const kingsRepository = new KingsRepository(apiClient)
      const initializedKingsService = await KingsService.createAndInitialize(
        kingsRepository
      )
      setKingsService(initializedKingsService)
    }
    initializeKingService()
  }, [apiClient])

  useEffect(() => {
    if (kingsService) {
      const wordRepository = new WordRepository(apiClient)
      const signsRepository = new SignRepository(apiClient, kingsService)
      const imageRepository = new ApiImageRepository(apiClient)
      const bibliographyRepository = new BibliographyRepository(apiClient)
      const afoRegisterRepository = new AfoRegisterRepository(apiClient)
      const findspotRepository = new ApiFindspotRepository(apiClient)
      const bibliographyService = new BibliographyService(
        bibliographyRepository
      )
      const fragmentRepository = new FragmentRepository(apiClient, kingsService)
      const fragmentService = new FragmentService(
        fragmentRepository,
        imageRepository,
        wordRepository,
        bibliographyService
      )
      const fragmentSearchService = new FragmentSearchService(
        fragmentRepository
      )
      const wordService = new WordService(wordRepository)
      const signService = new SignService(signsRepository)
      const textService = new TextService(
        apiClient,
        fragmentService,
        wordService,
        bibliographyService
      )
      const markupService = new MarkupService(apiClient, bibliographyService)
      const cachedMarkupService = new CachedMarkupService(
        apiClient,
        bibliographyService
      )
      const afoRegisterService = new AfoRegisterService(afoRegisterRepository)
      const findspotService = new FindspotService(findspotRepository)
      setServices({
        fragmentService,
        wordService,
        signService,
        bibliographyService,
        textService,
        markupService,
        cachedMarkupService,
        afoRegisterService,
        findspotService,
        fragmentSearchService,
      })
    }
  }, [apiClient, kingsService])

  const {
    fragmentService,
    wordService,
    signService,
    bibliographyService,
    textService,
    markupService,
    cachedMarkupService,
    afoRegisterService,
    findspotService,
    fragmentSearchService,
  } = services

  if (
    !kingsService ||
    !fragmentService ||
    !wordService ||
    !signService ||
    !fragmentSearchService ||
    !bibliographyService ||
    !textService ||
    !markupService ||
    !cachedMarkupService ||
    !afoRegisterService ||
    !findspotService
  ) {
    return <div>Loading...</div>
  }

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
      findspotService={findspotService}
      kingsService={kingsService}
    />
  )
}

function InjectedAuth0Provider({
  children,
}: PropsWithChildren<unknown>): JSX.Element {
  const auth0Config = createAuth0Config()
  const history = useHistory()
  return (
    <Auth0Provider
      domain={auth0Config.domain ?? ''}
      client_id={auth0Config.clientID ?? ''}
      redirect_uri={window.location.origin}
      onRedirectCallback={(appState): void => {
        history.push(
          appState && appState.targetUrl
            ? appState.targetUrl
            : window.location.pathname
        )
      }}
      scope={scopeString}
      audience={auth0Config.audience}
      returnTo={window.location.origin}
      useRefreshTokens={true}
      useCookiesForTransactions={true}
    >
      {children}
    </Auth0Provider>
  )
}

ReactDOM.render(
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
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
