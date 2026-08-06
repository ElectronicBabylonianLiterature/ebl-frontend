import React from 'react'
import { screen, within } from '@testing-library/react'
import App from 'App'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import ApiImageRepository from 'fragmentarium/infrastructure/ImageRepository'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import BibliographyService from 'bibliography/application/BibliographyService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import SignRepository from 'signs/infrastructure/SignRepository'
import SignService from 'signs/application/SignService'
import MarkupService, {
  CachedMarkupService,
} from 'markup/application/MarkupService'
import AfoRegisterRepository from 'afo-register/infrastructure/AfoRegisterRepository'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'
import RealiaService from 'realia/application/RealiaService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ApiFindspotRepository } from 'fragmentarium/infrastructure/FindspotRepository'
import FakeApi from 'test-support/FakeApi'
import DossiersService from 'dossiers/application/DossiersService'
import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import ApiClient from 'http/ApiClient'

export type JsonApiClient = {
  fetchJson: <T = unknown>(url: string, authorize: boolean) => Promise<T>
  postJson: <T = unknown>(
    url: string,
    body: Record<string, unknown>,
    authorize?: boolean,
  ) => Promise<T>
  fetchBlob: (url: string, authorize: boolean) => Promise<Blob>
}

export function getServices(api: JsonApiClient = new FakeApi().client): {
  signService: SignService
  wordService: WordService
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  bibliographyService: BibliographyService
  textService: TextService
  markupService: MarkupService
  cachedMarkupService: CachedMarkupService
  afoRegisterService: AfoRegisterService
  realiaService: RealiaService
  dossiersService: DossiersService
  findspotService: FindspotService
} {
  const apiClient = api as unknown as ApiClient
  const wordRepository = new WordRepository(apiClient)
  const fragmentRepository = new FragmentRepository(api)
  const imageRepository = new ApiImageRepository(api)
  const bibliographyRepository = new BibliographyRepository(apiClient)
  const findspotRepository = new ApiFindspotRepository(api)

  const wordService = new WordService(wordRepository)
  const bibliographyService = new BibliographyService(bibliographyRepository)
  const fragmentService = new FragmentService(
    fragmentRepository,
    imageRepository,
    wordRepository,
    bibliographyService,
  )
  const fragmentSearchService = new FragmentSearchService(fragmentRepository)
  const textService = new TextService(
    apiClient,
    fragmentService,
    wordService,
    bibliographyService,
  )
  const signsRepository = new SignRepository(apiClient)
  const afoRegisterRepository = new AfoRegisterRepository(apiClient)
  const realiaRepository = new RealiaRepository(apiClient)
  const dossiersRepository = new DossiersRepository(apiClient)
  const signService = new SignService(signsRepository)
  const markupService = new MarkupService(apiClient, bibliographyService)
  const cachedMarkupService = new CachedMarkupService(
    apiClient,
    bibliographyService,
  )
  const afoRegisterService = new AfoRegisterService(afoRegisterRepository)
  const realiaService = new RealiaService(realiaRepository)
  const dossiersService = new DossiersService(dossiersRepository)
  const findspotService = new FindspotService(findspotRepository)
  return {
    signService,
    wordService,
    fragmentService,
    fragmentSearchService,
    bibliographyService,
    textService,
    markupService,
    cachedMarkupService,
    afoRegisterService,
    realiaService,
    dossiersService,
    findspotService,
  }
}

export function createApp(api): JSX.Element {
  return <App {...getServices(api)} />
}

export const breadcrumbs = {
  getBreadcrumbs(): HTMLElement {
    return screen.getByRole('navigation', {
      name: 'breadcrumb',
    })
  },

  expectCrumbs(crumbs: readonly string[]): void {
    const crumbsElement = this.getBreadcrumbs()
    for (const crumb of crumbs) {
      expect(within(crumbsElement).getByText(crumb)).toBeInTheDocument()
    }
  },

  expectCrumb(crumb: string, link: string): void {
    expect(
      within(this.getBreadcrumbs()).getByRole('link', { name: crumb }),
    ).toHaveAttribute('href', link)
  },
} as const
