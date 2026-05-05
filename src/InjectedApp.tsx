import React, { useEffect, useMemo } from 'react'
import App from './App'

import ApiClient from 'http/ApiClient'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import ApiImageRepository from 'fragmentarium/infrastructure/ImageRepository'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import BibliographyService from 'bibliography/application/BibliographyService'
import TextService from 'corpus/application/TextService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import {
  AuthenticationService,
  eblNameProperty,
  useAuthentication,
} from 'auth/Auth'
import SignService from 'signs/application/SignService'
import SignRepository from 'signs/infrastructure/SignRepository'
import AfoRegisterRepository from 'afo-register/infrastructure/AfoRegisterRepository'
import MarkupService, {
  CachedMarkupService,
} from 'markup/application/MarkupService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ApiFindspotRepository } from 'fragmentarium/infrastructure/FindspotRepository'
import DossiersService from 'dossiers/application/DossiersService'
import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import { ErrorReporter } from 'ErrorReporterContext'

function getFragmentCacheScope(
  authenticationService: AuthenticationService,
): string {
  if (!authenticationService.isAuthenticated()) {
    return 'guest'
  }
  try {
    const user = authenticationService.getUser()
    const identity = user[eblNameProperty] ?? user.name ?? ''
    return `authenticated:${identity}`
  } catch {
    return 'authenticated'
  }
}

export default function InjectedApp({
  errorReporter,
}: {
  errorReporter: ErrorReporter
}): JSX.Element {
  const authenticationService = useAuthentication()
  const apiClient = useMemo(
    () => new ApiClient(authenticationService, errorReporter),
    [authenticationService, errorReporter],
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
        () => getFragmentCacheScope(authenticationService),
      ),
    [
      fragmentRepository,
      imageRepository,
      wordRepository,
      bibliographyService,
      authenticationService,
    ],
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
    textService.list().catch((error) => {
      errorReporter.captureException(error)
    })
    fragmentService.fetchGenres().catch((error) => {
      errorReporter.captureException(error)
    })
  }, [fragmentService, textService, errorReporter])
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
