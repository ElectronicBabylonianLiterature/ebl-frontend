import React from 'react'
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  Matcher,
  within,
  waitFor,
  ByRoleMatcher,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import _ from 'lodash'
import App from 'App'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import ApiImageRepository from 'fragmentarium/infrastructure/ImageRepository'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import MemorySession, { Session, guestSession } from 'auth/Session'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import BibliographyService from 'bibliography/application/BibliographyService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import Promise from 'bluebird'
import { eblNameProperty, AuthenticationContext } from 'auth/Auth'
import SignRepository from 'signs/infrastructure/SignRepository'
import SignService from 'signs/application/SignService'
import MarkupService, {
  CachedMarkupService,
} from 'markup/application/MarkupService'
import AfoRegisterRepository from 'afo-register/infrastructure/AfoRegisterRepository'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import { ApiFindspotRepository } from 'fragmentarium/infrastructure/FindspotRepository'
import FakeApi from 'test-support/FakeApi'
import DossiersService from 'dossiers/application/DossiersService'
import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import ApiClient from 'http/ApiClient'

type JsonApiClient = {
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
  const dossiersRepository = new DossiersRepository(apiClient)
  const signService = new SignService(signsRepository)
  const markupService = new MarkupService(apiClient, bibliographyService)
  const cachedMarkupService = new CachedMarkupService(
    apiClient,
    bibliographyService,
  )
  const afoRegisterService = new AfoRegisterService(afoRegisterRepository)
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
    dossiersService,
    findspotService,
  }
}

function createApp(api): JSX.Element {
  return <App {...getServices(api)} />
}

const breadcrumbs = {
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

export default class AppDriver {
  readonly breadcrumbs = breadcrumbs

  private initialEntries: string[] = []
  private view: RenderResult | null = null
  private session: Session | null = null

  constructor(private readonly api) {}

  getView(): RenderResult {
    if (this.view) {
      return this.view
    } else {
      throw new Error('getElement called before render.')
    }
  }

  withPath(path: string): AppDriver {
    this.initialEntries = [path]
    return this
  }

  withSession(): AppDriver {
    this.session = new MemorySession([
      'read:texts',
      'write:texts',
      'read:fragments',
      'annotate:fragments',
      'read:words',
    ])
    return this
  }

  render(): AppDriver {
    this.view = render(
      <MemoryRouter initialEntries={this.initialEntries}>
        <AuthenticationContext.Provider
          value={{
            login: _.noop,
            logout: async () => {},
            getSession: (): Session => this.session ?? guestSession,
            isAuthenticated: (): boolean => this.session !== null,
            getAccessToken(): Promise<string> {
              throw new Error('Not implemented')
            },
            getUser(): { [eblNameProperty]: string } {
              return { [eblNameProperty]: 'Test' }
            },
          }}
        >
          {createApp(this.api)}
        </AuthenticationContext.Provider>
      </MemoryRouter>,
    )

    return this
  }

  async waitForText(text: Matcher): Promise<void> {
    await this.getView().findAllByText(text)
  }

  async waitForTextToDisappear(text: Matcher): Promise<void> {
    await waitFor(() => {
      this.expectNotInContent(text)
    })
  }

  expectTextContent(text: string | RegExp): void {
    expect(this.getView().container).toHaveTextContent(text)
  }

  expectNotInContent(text: Matcher): void {
    expect(this.getView().queryByText(text)).not.toBeInTheDocument()
  }

  expectLink(text: Matcher, expectedHref: string): void {
    expect(this.getView().getByText(text)).toHaveAttribute('href', expectedHref)
  }

  expectInputElement(label: Matcher, expectedValue: unknown): void {
    expect(this.getView().getByLabelText(label)).toHaveValue(
      String(expectedValue),
    )
  }

  expectChecked(label: Matcher): void {
    expect(this.getView().getByLabelText(label)).toBeChecked()
  }

  expectNotChecked(label: Matcher): void {
    expect(this.getView().getByLabelText(label)).not.toBeChecked()
  }

  changeValueByLabel(label: Matcher, newValue: string): void {
    const input = this.getView().getByLabelText(label)
    fireEvent.change(input, { target: { value: newValue } })
  }

  click(text: Matcher, n = 0): void {
    const clickable = this.getView().getAllByText(text)[n]
    fireEvent.click(clickable)
  }

  clickByRole(role: ByRoleMatcher, name: string | RegExp, n = 0): void {
    const clickable = this.getView().getAllByRole(role, { name })[n]
    fireEvent.click(clickable)
  }

  async clickasync(text: Matcher, n = 0): Promise<void> {
    const clickable = this.getView().getAllByText(text)[n]
    await userEvent.click(clickable)
  }

  async clickByRoleasync(
    role: ByRoleMatcher,
    name: string | RegExp,
    n = 0,
  ): Promise<void> {
    const clickable = this.getView().getAllByRole(role, { name })[n]
    await userEvent.click(clickable)
  }
}
